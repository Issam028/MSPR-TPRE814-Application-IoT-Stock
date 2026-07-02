import { strict as assert } from 'assert';
import { evaluateMesureStatus, getThresholds } from '../src/mesures/mesure-status';
import { mapLotToErpStockMovement, mapMesureToErpQualityAlert } from '../src/erp/erp-export.mapper';
import {
  countMesuresToImport,
  loadDataTestsDataset,
  mesureKey,
  parseMesuresSql,
} from '../src/dataset/data-tests-dataset';

const thresholds = getThresholds({
  ALERT_TEMPERATURE_TARGET: '29',
  ALERT_TEMPERATURE_TOLERANCE: '3',
  ALERT_HUMIDITE_TARGET: '55',
  ALERT_HUMIDITE_TOLERANCE: '2',
});

assert.deepEqual(thresholds, {
  temperatureMin: 26,
  temperatureMax: 32,
  humiditeMin: 53,
  humiditeMax: 57,
});

assert.equal(evaluateMesureStatus({ temperature: 29, humidite: 55 }, thresholds), 'conforme');
assert.equal(evaluateMesureStatus({ temperature: 32, humidite: 57 }, thresholds), 'conforme');
assert.equal(evaluateMesureStatus({ temperature: 32.1, humidite: 55 }, thresholds), 'en alerte');
assert.equal(evaluateMesureStatus({ temperature: 29, humidite: 52.9 }, thresholds), 'en alerte');
assert.equal(evaluateMesureStatus({ temperature: null, humidite: 55 }, thresholds), 'en alerte');

const stockPayload = mapLotToErpStockMovement(
  {
    id_lot: 12,
    id_entrepot: 3,
    date_stockage: '2026-06-30T12:00:00.000Z',
    statut: 'en alerte',
  },
  'BR',
);

assert.equal(stockPayload.erpModule, 'STOCK');
assert.equal(stockPayload.externalId, 'BR-LOT-12');
assert.equal(stockPayload.warehouseId, 3);
assert.equal(stockPayload.qualityStatus, 'WARNING');

const qualityPayload = mapMesureToErpQualityAlert(
  {
    id_mesure: 26407,
    id_entrepot: 1,
    temperature: 32.25,
    humidite: 83.96,
    timestamp: '2026-06-30T13:00:00.000Z',
    statut: 'en alerte',
  },
  'BR',
);

assert.equal(qualityPayload.erpModule, 'QUALITY');
assert.equal(qualityPayload.externalId, 'BR-MESURE-26407');
assert.equal(qualityPayload.qualityStatus, 'NON_CONFORMITY');
assert.equal(qualityPayload.temperature, 32.25);

const datasetPlan = loadDataTestsDataset();
assert.equal(datasetPlan.stats.rowsRead, 129);
assert.equal(datasetPlan.exploitations.length, 2);
assert.equal(datasetPlan.entrepots.length, 7);
assert.equal(datasetPlan.mesures.length, 105);
assert.equal(datasetPlan.stats.rowsRejected, 15);
assert.equal(datasetPlan.rejectedRows.every((row) => row.reason.includes('entrepot 5 absent')), true);

const firstImport = countMesuresToImport(datasetPlan.mesures, new Set());
assert.deepEqual(firstImport, { imported: 105, ignored: 0 });

const existingMesureKeys = new Set(datasetPlan.mesures.map((mesure) => mesureKey(mesure)));
const secondImport = countMesuresToImport(datasetPlan.mesures, existingMesureKeys);
assert.deepEqual(secondImport, { imported: 0, ignored: 105 });

const invalidMesures = parseMesuresSql(
  "(1, 20.0, 50.0, NULL, '2026-04-18 08:00:00'),\n" +
    "(999, 20.0, 50.0, NULL, '2026-04-18 08:00:00'),\n" +
    "(1, 20.0, 50.0, NULL, 'invalid-date')",
  new Set([1]),
);
assert.equal(invalidMesures.rows.length, 1);
assert.equal(invalidMesures.rejectedRows.length, 2);

console.log('FutureKawa automated tests passed');
