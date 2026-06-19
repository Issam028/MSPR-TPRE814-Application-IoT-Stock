#include <DHT.h>

const int ENTREPOT_ID = 1;
const int DHT_PIN = 32;
const int DHT_TYPE = DHT11;
const unsigned long INTERVAL_MS = 10000;

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("FutureKawa ESP32 + DHT11 serial bridge");
  dht.begin();
}

void loop() {
  float humidite = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidite) || isnan(temperature)) {
    Serial.println("DHT11 read failed");
    delay(INTERVAL_MS);
    return;
  }

  Serial.print("{\"id_entrepot\":");
  Serial.print(ENTREPOT_ID);
  Serial.print(",\"temperature\":");
  Serial.print(temperature, 1);
  Serial.print(",\"humidite\":");
  Serial.print(humidite, 1);
  Serial.println("}");

  delay(INTERVAL_MS);
}
