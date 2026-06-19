# ESP32 + DHT11 real sensor

This folder is for the real hardware:

- Board: ESP32
- Sensor: DHT11 temperature and humidity
- API target: `POST http://localhost:3000/mesures`

## Wiring

| DHT11 pin | ESP32 pin |
| --- | --- |
| VCC / + | 3V3 |
| GND / - | GND |
| OUT / DATA | GPIO32 |

In the code this is:

```cpp
const int DHT_PIN = 32;
```

## Arduino IDE setup

1. Open Arduino IDE.
2. Install the ESP32 board package:
   - File > Preferences
   - Additional Boards Manager URLs:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools > Board > Boards Manager
   - Search `esp32`
   - Install `esp32 by Espressif Systems`
3. Select the board:
   - Tools > Board > ESP32 Arduino > ESP32 Dev Module
4. Select the port:
   - Tools > Port > `COM5` or the port shown by Windows
5. Install libraries:
   - Sketch > Include Library > Manage Libraries
   - Install `DHT sensor library` by Adafruit
   - Install `Adafruit Unified Sensor`

## Recommended test: USB serial bridge

Use this first. It works even if the ESP32 cannot connect directly to school WiFi.

1. Open this sketch in Arduino IDE:

```text
iot/esp32-dht11/arduino/ESP32_DHT11_SerialBridge/ESP32_DHT11_SerialBridge.ino
```

2. Upload it to the ESP32.
3. Open Serial Monitor at `115200` baud. You should see lines like:

```json
{"id_entrepot":1,"temperature":26.0,"humidite":55.0}
```

4. Close Serial Monitor. Only one program can use `COM5` at a time.
5. Start the project:

```powershell
docker compose --profile dev up --build -d
```

6. Forward the ESP32 readings to the API:

```powershell
python iot/esp32-dht11/pc-serial-bridge/serial_bridge.py --port COM5 --api-url http://localhost:3000/mesures
```

## Direct WiFi version

Only use this if the ESP32 is connected to a simple WiFi network or phone hotspot.

Open:

```text
iot/esp32-dht11/arduino/ESP32_DHT11_FutureKawa/ESP32_DHT11_FutureKawa.ino
```

Then change:

```cpp
const char* WIFI_SSID = "CHANGE_ME";
const char* WIFI_PASSWORD = "CHANGE_ME";
const char* API_URL = "http://10.60.65.243:3000/mesures";
```

`API_URL` must use your PC IP address, not `localhost`, because the ESP32 has its own network connection.

## What the sketch does

- Reads temperature from the DHT11.
- Reads humidity from the DHT11.
- Sends this JSON shape to the project:

```json
{"id_entrepot":1,"temperature":26.0,"humidite":55.0}
```

The backend stores the measure and marks it `conforme` or `en alerte` using the existing project thresholds.
