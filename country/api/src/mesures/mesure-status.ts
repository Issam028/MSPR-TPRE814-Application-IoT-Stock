export interface MesureStatusInput {
  temperature?: number | null;
  humidite?: number | null;
}

export interface MesureThresholds {
  temperatureMin: number;
  temperatureMax: number;
  humiditeMin: number;
  humiditeMax: number;
}

const toFloat = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getThresholds = (env: NodeJS.ProcessEnv = process.env): MesureThresholds => {
  const temperatureTarget = toFloat(env.ALERT_TEMPERATURE_TARGET, 27);
  const temperatureTolerance = toFloat(env.ALERT_TEMPERATURE_TOLERANCE, 3);
  const humiditeTarget = toFloat(env.ALERT_HUMIDITE_TARGET, 55);
  const humiditeTolerance = toFloat(env.ALERT_HUMIDITE_TOLERANCE, 5);

  return {
    temperatureMin: temperatureTarget - temperatureTolerance,
    temperatureMax: temperatureTarget + temperatureTolerance,
    humiditeMin: humiditeTarget - humiditeTolerance,
    humiditeMax: humiditeTarget + humiditeTolerance,
  };
};

export const evaluateMesureStatus = (
  mesure: MesureStatusInput,
  thresholds: MesureThresholds = getThresholds(),
): 'conforme' | 'en alerte' => {
  const temperatureOk =
    mesure.temperature !== null &&
    mesure.temperature !== undefined &&
    mesure.temperature >= thresholds.temperatureMin &&
    mesure.temperature <= thresholds.temperatureMax;
  const humiditeOk =
    mesure.humidite !== null &&
    mesure.humidite !== undefined &&
    mesure.humidite >= thresholds.humiditeMin &&
    mesure.humidite <= thresholds.humiditeMax;

  return temperatureOk && humiditeOk ? 'conforme' : 'en alerte';
};
