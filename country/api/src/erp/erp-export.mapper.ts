type LotLike = {
  id_lot: number;
  id_entrepot: number;
  date_stockage: Date | string;
  statut?: string | null;
};

type MesureLike = {
  id_mesure: number;
  id_entrepot: number;
  temperature?: number | null;
  humidite?: number | null;
  timestamp: Date | string;
  statut?: string | null;
};

const normalizeDate = (value: Date | string): string => new Date(value).toISOString();

const normalizeLotStatus = (statut?: string | null): 'AVAILABLE' | 'WARNING' | 'BLOCKED' => {
  if (statut === 'périmé' || statut === 'perime') return 'BLOCKED';
  if (statut === 'en alerte') return 'WARNING';
  return 'AVAILABLE';
};

export const mapLotToErpStockMovement = (lot: LotLike, countryCode = 'BR') => ({
  erpSystem: 'FutureKawa-ERP-Adapter',
  erpModule: 'STOCK',
  externalId: `${countryCode}-LOT-${lot.id_lot}`,
  warehouseId: Number(lot.id_entrepot),
  stockDate: normalizeDate(lot.date_stockage),
  qualityStatus: normalizeLotStatus(lot.statut),
  sourceStatus: lot.statut ?? 'conforme',
});

export const mapMesureToErpQualityAlert = (mesure: MesureLike, countryCode = 'BR') => ({
  erpSystem: 'FutureKawa-ERP-Adapter',
  erpModule: 'QUALITY',
  externalId: `${countryCode}-MESURE-${mesure.id_mesure}`,
  warehouseId: Number(mesure.id_entrepot),
  measuredAt: normalizeDate(mesure.timestamp),
  temperature: mesure.temperature,
  humidity: mesure.humidite,
  qualityStatus: mesure.statut === 'en alerte' ? 'NON_CONFORMITY' : 'OK',
  sourceStatus: mesure.statut ?? 'conforme',
});
