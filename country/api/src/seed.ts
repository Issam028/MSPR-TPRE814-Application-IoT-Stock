import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Entrepot } from './entrepots/entrepot.entity';
import { Exploitation } from './exploitations/exploitation.entity';
import { Lot } from './lots/lot.entity';
import { Mesure } from './mesures/mesure.entity';

const TEMPERATURE_MIN = 24;
const TEMPERATURE_MAX = 30;
const HUMIDITE_MIN = 50;
const HUMIDITE_MAX = 60;
const EXPIRED_AFTER_DAYS = 365;
const ALERT_FROM_DAYS = 330;

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toFloat = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const titleCase = (value: string): string =>
  value
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const config = {
  exploitations: Math.max(0, toInt(process.env.SEED_EXPLOITATIONS, 3)),
  entrepotsPerExploitation: Math.max(
    0,
    toInt(process.env.SEED_ENTREPOTS_PER_EXPLOITATION, 2),
  ),
  lotsPerEntrepot: Math.max(0, toInt(process.env.SEED_LOTS_PER_ENTREPOT, 4)),
  mesuresPerEntrepot: Math.max(0, toInt(process.env.SEED_MESURES_PER_ENTREPOT, 6)),
  alertProbability: clamp(toFloat(process.env.SEED_ALERT_PROBABILITY, 0.35), 0, 1),
  truncate: (process.env.SEED_TRUNCATE ?? '').toLowerCase() === 'true',
};

const seedValue = toInt(process.env.SEED_RANDOM_SEED, 0);
if (seedValue) {
  faker.seed(seedValue);
}

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: toInt(process.env.DB_PORT, 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'brazil_db',
  entities: [Lot, Mesure, Exploitation, Entrepot],
  synchronize: false,
});

const evaluateLotStatus = (dateStockage?: Date): string => {
  if (!dateStockage) return 'conforme';

  const ageInDays = Math.floor((Date.now() - dateStockage.getTime()) / 86400000);

  if (ageInDays > EXPIRED_AFTER_DAYS) return 'p\u00e9rim\u00e9';
  if (ageInDays >= ALERT_FROM_DAYS) return 'en alerte';
  return 'conforme';
};

const evaluateMesureStatus = (temperature: number, humidite: number): string => {
  const temperatureOk =
    temperature >= TEMPERATURE_MIN && temperature <= TEMPERATURE_MAX;
  const humiditeOk = humidite >= HUMIDITE_MIN && humidite <= HUMIDITE_MAX;
  return temperatureOk && humiditeOk ? 'conforme' : 'en alerte';
};

const createMesureValues = (): { temperature: number; humidite: number } => {
  const shouldAlert =
    faker.number.float({ min: 0, max: 1, fractionDigits: 2 }) <
    config.alertProbability;
  let temperature = faker.number.float({
    min: TEMPERATURE_MIN,
    max: TEMPERATURE_MAX,
    fractionDigits: 1,
  });
  let humidite = faker.number.float({
    min: HUMIDITE_MIN,
    max: HUMIDITE_MAX,
    fractionDigits: 1,
  });

  if (shouldAlert) {
    if (faker.number.float({ min: 0, max: 1, fractionDigits: 2 }) < 0.5) {
      temperature = faker.number.float({ min: 31, max: 35, fractionDigits: 1 });
    } else {
      humidite = faker.number.float({ min: 35, max: 45, fractionDigits: 1 });
    }
  }

  return { temperature, humidite };
};

const truncateAll = async (): Promise<void> => {
  await dataSource.query('SET FOREIGN_KEY_CHECKS=0');
  await dataSource.query('TRUNCATE TABLE mesures');
  await dataSource.query('TRUNCATE TABLE lots');
  await dataSource.query('TRUNCATE TABLE entrepots');
  await dataSource.query('TRUNCATE TABLE exploitations');
  await dataSource.query('SET FOREIGN_KEY_CHECKS=1');
};

const seed = async (): Promise<void> => {
  await dataSource.initialize();

  if (config.truncate) {
    await truncateAll();
  }

  const exploitationsRepo = dataSource.getRepository(Exploitation);
  const entrepotsRepo = dataSource.getRepository(Entrepot);
  const lotsRepo = dataSource.getRepository(Lot);
  const mesuresRepo = dataSource.getRepository(Mesure);

  let exploitationsCount = 0;
  let entrepotsCount = 0;
  let lotsCount = 0;
  let mesuresCount = 0;

  for (let i = 0; i < config.exploitations; i += 1) {
    const exploitationName = titleCase(
      `${faker.word.adjective()} ${faker.word.noun()}`,
    );
    const exploitation = exploitationsRepo.create({
      nom: `Exploitation ${exploitationName}`,
    });
    const savedExploitation = await exploitationsRepo.save(exploitation);
    exploitationsCount += 1;

    for (let j = 0; j < config.entrepotsPerExploitation; j += 1) {
      const entrepotName = titleCase(
        `${faker.word.adjective()} ${faker.word.noun()}`,
      );
      const entrepot = entrepotsRepo.create({
        id_exploitation: savedExploitation.id_exploitation,
        nom: `Entrepot ${entrepotName}`,
      });
      const savedEntrepot = await entrepotsRepo.save(entrepot);
      entrepotsCount += 1;

      const lots: Lot[] = [];
      for (let k = 0; k < config.lotsPerEntrepot; k += 1) {
        const daysAgo = faker.number.int({ min: 0, max: 420 });
        const dateStockage = new Date(Date.now() - daysAgo * 86400000);
        lots.push(
          lotsRepo.create({
            id_entrepot: savedEntrepot.id_entrepot,
            date_stockage: dateStockage,
            statut: evaluateLotStatus(dateStockage),
          }),
        );
      }

      if (lots.length) {
        await lotsRepo.save(lots);
        lotsCount += lots.length;
      }

      const mesures: Mesure[] = [];
      for (let k = 0; k < config.mesuresPerEntrepot; k += 1) {
        const { temperature, humidite } = createMesureValues();
        mesures.push(
          mesuresRepo.create({
            id_entrepot: savedEntrepot.id_entrepot,
            temperature,
            humidite,
            statut: evaluateMesureStatus(temperature, humidite),
            timestamp: faker.date.recent({ days: 7 }),
          }),
        );
      }

      if (mesures.length) {
        await mesuresRepo.save(mesures);
        mesuresCount += mesures.length;
      }
    }
  }

  await dataSource.destroy();

  console.log(
    `Seed complete: ${exploitationsCount} exploitations, ${entrepotsCount} entrepots, ${lotsCount} lots, ${mesuresCount} mesures.`,
  );
};

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exitCode = 1;
});
