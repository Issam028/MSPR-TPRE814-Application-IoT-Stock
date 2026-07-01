import { strict as assert } from 'assert';
import { evaluateMesureStatus, getThresholds } from '../src/mesures/mesure-status';
import { mapLotToErpStockMovement, mapMesureToErpQualityAlert } from '../src/erp/erp-export.mapper';

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

console.log('FutureKawa automated tests passed');
