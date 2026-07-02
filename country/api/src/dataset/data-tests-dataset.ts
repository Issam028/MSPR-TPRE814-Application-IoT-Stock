import { readFileSync } from 'fs';
import { resolve } from 'path';
import { evaluateMesureStatus } from '../mesures/mesure-status';

export interface DatasetExploitation {
  id_exploitation: number;
  nom: string;
}

export interface DatasetEntrepot {
  id_entrepot: number;
  id_exploitation: number;
  nom: string;
}

export interface DatasetMesure {
  id_entrepot: number;
  temperature: number;
  humidite: number;
  statut: 'conforme' | 'en alerte';
  timestamp: string;
}

export interface DatasetRejectedRow {
  table: 'exploitations' | 'entrepots' | 'mesures';
  row: string;
  reason: string;
}

export interface DatasetImportPlan {
  files: {
    exploitations: string;
    entrepots: string;
    mesures: string;
  };
  exploitations: DatasetExploitation[];
  entrepots: DatasetEntrepot[];
  mesures: DatasetMesure[];
  rejectedRows: DatasetRejectedRow[];
  stats: {
    rowsRead: number;
    rowsImportable: number;
    rowsIgnoredInFile: number;
    rowsRejected: number;
  };
}

export interface MesureImportStats {
  imported: number;
  ignored: number;
}

const PROJECT_ROOT = resolve(__dirname, '../../../..');
const DEFAULT_DATASET_DIR = resolve(PROJECT_ROOT, 'docs/data_tests');

const parseNumber = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDateTime = (value: string): string | null => {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return null;
  }
  return trimmed;
};

export const mesureKey = (mesure: Pick<DatasetMesure, 'id_entrepot' | 'timestamp'>): string =>
  `${mesure.id_entrepot}|${mesure.timestamp}`;

export const countMesuresToImport = (
  mesures: DatasetMesure[],
  existingKeys: Set<string>,
): MesureImportStats => {
  let imported = 0;
  let ignored = 0;

  for (const mesure of mesures) {
    const key = mesureKey(mesure);
    if (existingKeys.has(key)) {
      ignored += 1;
    } else {
      existingKeys.add(key);
      imported += 1;
    }
  }

  return { imported, ignored };
};

export const parseExploitationsSql = (
  content: string,
): { rows: DatasetExploitation[]; rejectedRows: DatasetRejectedRow[]; rawRows: number } => {
  const rejectedRows: DatasetRejectedRow[] = [];
  const rows: DatasetExploitation[] = [];
  const seen = new Set<number>();
  const pattern = /\((\d+),\s*'([^']*)'\)/g;

  for (const match of content.matchAll(pattern)) {
    const raw = match[0];
    const id = parseNumber(match[1]);
    const nom = match[2].trim();

    if (!id || !nom) {
      rejectedRows.push({ table: 'exploitations', row: raw, reason: 'id_exploitation et nom obligatoires' });
      continue;
    }
    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    rows.push({ id_exploitation: id, nom });
  }

  return { rows, rejectedRows, rawRows: rows.length + rejectedRows.length };
};

export const parseEntrepotsSql = (
  content: string,
  exploitationIds: Set<number>,
): { rows: DatasetEntrepot[]; rejectedRows: DatasetRejectedRow[]; rawRows: number; ignoredRows: number } => {
  const rejectedRows: DatasetRejectedRow[] = [];
  const rows: DatasetEntrepot[] = [];
  const seen = new Set<number>();
  let ignoredRows = 0;
  const pattern = /\((\d+),\s*(\d+),\s*'([^']*)'\)/g;

  for (const match of content.matchAll(pattern)) {
    const raw = match[0];
    const id = parseNumber(match[1]);
    const idExploitation = parseNumber(match[2]);
    const nom = match[3].trim();

    if (!id || !idExploitation || !nom) {
      rejectedRows.push({ table: 'entrepots', row: raw, reason: 'id_entrepot, id_exploitation et nom obligatoires' });
      continue;
    }
    if (!exploitationIds.has(idExploitation)) {
      rejectedRows.push({ table: 'entrepots', row: raw, reason: `exploitation ${idExploitation} absente du dataset` });
      continue;
    }
    if (seen.has(id)) {
      ignoredRows += 1;
      continue;
    }

    seen.add(id);
    rows.push({ id_entrepot: id, id_exploitation: idExploitation, nom });
  }

  return { rows, rejectedRows, rawRows: rows.length + rejectedRows.length + ignoredRows, ignoredRows };
};

export const parseMesuresSql = (
  content: string,
  entrepotIds: Set<number>,
): { rows: DatasetMesure[]; rejectedRows: DatasetRejectedRow[]; rawRows: number; ignoredRows: number } => {
  const rejectedRows: DatasetRejectedRow[] = [];
  const rows: DatasetMesure[] = [];
  const seen = new Set<string>();
  let ignoredRows = 0;
  const pattern = /\((\d+),\s*([-+]?\d+(?:\.\d+)?),\s*([-+]?\d+(?:\.\d+)?),\s*(NULL|'[^']*'),\s*'([^']+)'\)/g;

  for (const match of content.matchAll(pattern)) {
    const raw = match[0];
    const idEntrepot = parseNumber(match[1]);
    const temperature = parseNumber(match[2]);
    const humidite = parseNumber(match[3]);
    const timestamp = parseDateTime(match[5]);

    if (!idEntrepot || temperature === null || humidite === null || !timestamp) {
      rejectedRows.push({ table: 'mesures', row: raw, reason: 'id_entrepot, temperature, humidite et timestamp obligatoires' });
      continue;
    }
    if (!entrepotIds.has(idEntrepot)) {
      rejectedRows.push({ table: 'mesures', row: raw, reason: `entrepot ${idEntrepot} absent du dataset` });
      continue;
    }

    const key = `${idEntrepot}|${timestamp}`;
    if (seen.has(key)) {
      ignoredRows += 1;
      continue;
    }

    seen.add(key);
    rows.push({
      id_entrepot: idEntrepot,
      temperature,
      humidite,
      statut: evaluateMesureStatus({ temperature, humidite }),
      timestamp,
    });
  }

  return { rows, rejectedRows, rawRows: rows.length + rejectedRows.length + ignoredRows, ignoredRows };
};

export const loadDataTestsDataset = (datasetDir = DEFAULT_DATASET_DIR): DatasetImportPlan => {
  const files = {
    exploitations: resolve(datasetDir, 'exploitations.sql'),
    entrepots: resolve(datasetDir, 'entrepots.sql'),
    mesures: resolve(datasetDir, 'mesures.sql'),
  };

  const exploitationsResult = parseExploitationsSql(readFileSync(files.exploitations, 'utf-8'));
  const exploitationIds = new Set(exploitationsResult.rows.map((row) => row.id_exploitation));
  const entrepotsResult = parseEntrepotsSql(readFileSync(files.entrepots, 'utf-8'), exploitationIds);
  const entrepotIds = new Set(entrepotsResult.rows.map((row) => row.id_entrepot));
  const mesuresResult = parseMesuresSql(readFileSync(files.mesures, 'utf-8'), entrepotIds);

  const rejectedRows = [
    ...exploitationsResult.rejectedRows,
    ...entrepotsResult.rejectedRows,
    ...mesuresResult.rejectedRows,
  ];
  const rowsIgnoredInFile = entrepotsResult.ignoredRows + mesuresResult.ignoredRows;
  const rowsRead = exploitationsResult.rawRows + entrepotsResult.rawRows + mesuresResult.rawRows;
  const rowsImportable =
    exploitationsResult.rows.length + entrepotsResult.rows.length + mesuresResult.rows.length;

  return {
    files,
    exploitations: exploitationsResult.rows,
    entrepots: entrepotsResult.rows,
    mesures: mesuresResult.rows,
    rejectedRows,
    stats: {
      rowsRead,
      rowsImportable,
      rowsIgnoredInFile,
      rowsRejected: rejectedRows.length,
    },
  };
};
