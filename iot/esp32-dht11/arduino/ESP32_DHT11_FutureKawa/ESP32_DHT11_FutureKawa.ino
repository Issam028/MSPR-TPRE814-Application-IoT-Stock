#include <DHT.h>
#include <HTTPClient.h>
#include <WiFi.h>

const char* WIFI_SSID = "CHANGE_ME";
const char* WIFI_PASSWORD = "CHANGE_ME";

// Use the IP address of the PC running Docker, not localhost.
const char* API_URL = "http://10.60.65.243:3000/mesures";

const int ENTREPOT_ID = 1;
const int DHT_PIN = 32;
const int DHT_TYPE = DHT11;
const unsigned long INTERVAL_MS = 10000;

DHT dht(DHT_PIN, DHT_TYPE);

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

void sendReading(float temperature, float humidite) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }

  HTTPClient http;

  String payload = "{";
  payload += "\"id_entrepot\":";
  payload += ENTREPOT_ID;
  payload += ",\"temperature\":";
  payload += String(temperature, 1);
  payload += ",\"humidite\":";
  payload += String(humidite, 1);
  payload += "}";

  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  int statusCode = http.POST(payload);

  Serial.print("Payload: ");
  Serial.println(payload);
  Serial.print("HTTP status: ");
  Serial.println(statusCode);

  if (statusCode > 0) {
    Serial.println(http.getString());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("FutureKawa ESP32 + DHT11");
  dht.begin();
  connectWifi();
}

void loop() {
  float humidite = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidite) || isnan(temperature)) {
    Serial.println("DHT11 read failed");
    delay(INTERVAL_MS);
    return;
  }

  sendReading(temperature, humidite);
  delay(INTERVAL_MS);
}
