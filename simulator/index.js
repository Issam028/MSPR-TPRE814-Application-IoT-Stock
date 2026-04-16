const apiUrl = (process.env.SIMULATOR_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const entrepotId = process.env.SIMULATOR_ENTREPOT_ID || 'COFFEE-01';
const intervalMs = Number(process.env.SIMULATOR_INTERVAL_MS || 5000);
const mode = (process.env.SIMULATOR_MODE || 'mixed').toLowerCase();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const round = (value) => Math.round(value * 100) / 100;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

async function waitForApi() {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${apiUrl}/mesures`, { method: 'GET' });
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {
      // Ignore and retry.
    }

    console.log(`[iot-simulator] waiting for API (${attempt}/${maxAttempts})...`);
    await sleep(2000);
  }

  throw new Error(`API not reachable at ${apiUrl}`);
}

function buildReading() {
  if (mode === 'alert') {
    return {
      id_entrepot: entrepotId,
      temperature: round(randomBetween(32, 36)),
      humidite: round(randomBetween(78, 90)),
    };
  }

  if (mode === 'normal') {
    return {
      id_entrepot: entrepotId,
      temperature: round(randomBetween(25, 29)),
      humidite: round(randomBetween(50, 60)),
    };
  }

  const isAlertSample = Math.random() < 0.2;
  return isAlertSample
    ? {
        id_entrepot: entrepotId,
        temperature: round(randomBetween(32, 36)),
        humidite: round(randomBetween(78, 90)),
      }
    : {
        id_entrepot: entrepotId,
        temperature: round(randomBetween(25, 29)),
        humidite: round(randomBetween(50, 60)),
      };
}

async function sendReading() {
  const payload = buildReading();
  const response = await fetch(`${apiUrl}/mesures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body}`);
  }

  const saved = await response.json();
  console.log(
    `[iot-simulator] sent ${payload.temperature}C / ${payload.humidite}% for ${payload.id_entrepot} -> mesure ${saved.id_mesure}`,
  );
}

async function main() {
  console.log(
    `[iot-simulator] target=${apiUrl} entrepot=${entrepotId} interval=${intervalMs}ms mode=${mode}`,
  );

  await waitForApi();

  while (true) {
    try {
      await sendReading();
    } catch (error) {
      console.error(`[iot-simulator] send failed: ${error.message}`);
    }

    await sleep(intervalMs);
  }
}

main().catch((error) => {
  console.error(`[iot-simulator] fatal: ${error.message}`);
  process.exit(1);
});