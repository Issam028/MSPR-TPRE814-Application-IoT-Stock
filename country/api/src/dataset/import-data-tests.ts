import mysql from 'mysql2/promise';
import { countMesuresToImport, loadDataTestsDataset, mesureKey } from './data-tests-dataset';

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isDryRun = process.argv.includes('--dry-run');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: toInt(process.env.DB_PORT, 3308),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'colombia_db',
};

const printPlan = (plan: ReturnType<typeof loadDataTestsDataset>): void => {
  console.log('FutureKawa dataset import');
  console.log(`Files:`);
  console.log(`- exploitations: ${plan.files.exploitations}`);
  console.log(`- entrepots: ${plan.files.entrepots}`);
  console.log(`- mesures: ${plan.files.mesures}`);
  console.log(`Rows read: ${plan.stats.rowsRead}`);
  console.log(`Rows importable: ${plan.stats.rowsImportable}`);
  console.log(`Rows ignored in file: ${plan.stats.rowsIgnoredInFile}`);
  console.log(`Rows rejected: ${plan.stats.rowsRejected}`);
  console.log(`Exploitations importable: ${plan.exploitations.length}`);
  console.log(`Entrepots importable: ${plan.entrepots.length}`);
  console.log(`Mesures importable: ${plan.mesures.length}`);

  if (plan.rejectedRows.length) {
    console.log('Rejected rows:');
    for (const rejected of plan.rejectedRows) {
      console.log(`- ${rejected.table}: ${rejected.reason} | ${rejected.row}`);
    }
  }
};

const importDataset = async (): Promise<void> => {
  const plan = loadDataTestsDataset();
  printPlan(plan);

  if (isDryRun) {
    const simulated = countMesuresToImport(plan.mesures, new Set());
    console.log(`Dry-run mesures imported: ${simulated.imported}`);
    console.log(`Dry-run mesures ignored: ${simulated.ignored}`);
    return;
  }

  const connection = await mysql.createConnection(config);
  try {
    let imported = 0;
    let ignored = plan.stats.rowsIgnoredInFile;

    await connection.beginTransaction();

    for (const exploitation of plan.exploitations) {
      await connection.execute(
        `INSERT INTO exploitations (id_exploitation, nom)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE nom = VALUES(nom)`,
        [exploitation.id_exploitation, exploitation.nom],
      );
      imported += 1;
    }

    for (const entrepot of plan.entrepots) {
      await connection.execute(
        `INSERT INTO entrepots (id_entrepot, id_exploitation, nom)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE id_exploitation = VALUES(id_exploitation), nom = VALUES(nom)`,
        [entrepot.id_entrepot, entrepot.id_exploitation, entrepot.nom],
      );
      imported += 1;
    }

    const existingKeys = new Set<string>();
    const [existingRows] = await connection.query(
      'SELECT id_entrepot, DATE_FORMAT(timestamp, "%Y-%m-%d %H:%i:%s") AS timestamp FROM mesures',
    );
    for (const row of existingRows as Array<{ id_entrepot: number; timestamp: string }>) {
      existingKeys.add(`${row.id_entrepot}|${row.timestamp}`);
    }

    for (const mesure of plan.mesures) {
      const key = mesureKey(mesure);
      if (existingKeys.has(key)) {
        ignored += 1;
        continue;
      }

      await connection.execute(
        `INSERT INTO mesures (id_entrepot, temperature, humidite, statut, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [mesure.id_entrepot, mesure.temperature, mesure.humidite, mesure.statut, mesure.timestamp],
      );
      existingKeys.add(key);
      imported += 1;
    }

    await connection.commit();
    console.log(`Rows imported or updated: ${imported}`);
    console.log(`Rows ignored: ${ignored}`);
    console.log(`Rows rejected: ${plan.stats.rowsRejected}`);
    console.log(`Target database: ${config.host}:${config.port}/${config.database}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};

importDataset().catch((error) => {
  console.error('Dataset import failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
