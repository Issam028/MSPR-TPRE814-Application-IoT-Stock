WIFI_SSID = "CHANGE_ME"
WIFI_PASSWORD = "CHANGE_ME"

# HTTP direct mode only. Use the IP address of the PC running Docker, not localhost.
API_URL = "http://10.60.65.243:3000/mesures"

# MQTT mode. Use your PC IPv4 address when the ESP32 is on the same WiFi/hotspot.
MQTT_BROKER = "10.60.65.243"
MQTT_PORT = 1883
MQTT_TOPIC = "futurekawa/mesures"
MQTT_CLIENT_ID = "futurekawa-esp32-dht11"

ENTREPOT_ID = 1
DHT_PIN = 32
INTERVAL_SECONDS = 10