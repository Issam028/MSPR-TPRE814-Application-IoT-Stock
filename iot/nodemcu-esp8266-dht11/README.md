# NodeMCU ESP8266 + DHT11

This folder adds the real IoT device integration for FutureKawa.

The board reads temperature and humidity from a DHT11 sensor, then sends the values to the `country` API:

```http
POST /mesures
```

Payload:

```json
{
  "id_entrepot": 1,
  "temperature": 26,
  "humidite": 55
}
```

## Hardware

Tested target:

- Microcontroller: NodeMCU ESP8266
- Sensor: DHT11 temperature + humidity
- USB serial port detected on this PC: `COM5`
- PC API IP detected on this PC: `10.60.65.243`

## Wiring

For a common 3-pin DHT11 module:

| DHT11 | NodeMCU ESP8266 |
| --- | --- |
| VCC / + | 3V3 |
| GND / - | GND |
| DATA / OUT | D4 |

In code, NodeMCU `D4` is ESP8266 `GPIO2`.

If you use a bare 4-pin DHT11 sensor, add a 10k pull-up resistor between DATA and 3V3.

## Start the backend first

From the project root:

```powershell
docker compose --profile dev up --build -d
```

The ESP8266 must call the PC IP address, not `localhost`.

Use:

```text
http://10.60.65.243:3000/mesures
```

## Option A: MicroPython

Use this option if the ESP8266 has MicroPython installed.

Install the upload tool:

```powershell
python -m pip install mpremote
```

Create the local config file:

```powershell
cd "C:\Users\reyis\Desktop\Projects\MSPR-TPRE814-Application-IoT-Stock\iot\nodemcu-esp8266-dht11\micropython"
copy config.example.py config.py
```

Edit `config.py` and set:

```python
WIFI_SSID = "your_wifi_name"
WIFI_PASSWORD = "your_wifi_password"
API_URL = "http://10.60.65.243:3000/mesures"
ENTREPOT_ID = 1
DHT_PIN = 2
```

Upload to the board on `COM5`:

```powershell
python -m mpremote connect COM5 fs cp config.py :config.py
python -m mpremote connect COM5 fs cp main.py :main.py
python -m mpremote connect COM5 reset
```

Watch the serial output:

```powershell
python -m mpremote connect COM5 repl
```

## Option B: Arduino IDE

Use this option if the ESP8266 is programmed with Arduino IDE instead of MicroPython.

Open:

```text
iot/nodemcu-esp8266-dht11/arduino/NodeMCU_DHT11_FutureKawa/NodeMCU_DHT11_FutureKawa.ino
```

In Arduino IDE:

- Board: `NodeMCU 1.0 (ESP-12E Module)`
- Port: `COM5`
- Install libraries:
  - `DHT sensor library`
  - `Adafruit Unified Sensor`

Edit these values in the sketch:

```cpp
const char* WIFI_SSID = "your_wifi_name";
const char* WIFI_PASSWORD = "your_wifi_password";
const char* API_URL = "http://10.60.65.243:3000/mesures";
```

Upload the sketch, then open Serial Monitor at `115200`.

## Verify data arrives

After the board sends a reading:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mesures/entrepot/1/latest"
```

Open the app:

```text
http://localhost:8080
```

If the DHT11 sends values outside the accepted range, the alert UI will show the warehouse in alert.


## Option C: USB serial bridge

Use this option if the ESP8266 cannot connect to the current WiFi network. Your current WiFi is WPA2-Enterprise, which is often difficult for ESP8266 examples. The board reads the DHT11 and prints JSON over USB, then the PC forwards it to the API.

Arduino serial-only sketch:

```text
iot/nodemcu-esp8266-dht11/arduino/NodeMCU_DHT11_SerialBridge/NodeMCU_DHT11_SerialBridge.ino
```

MicroPython serial-only script:

```text
iot/nodemcu-esp8266-dht11/micropython/main_serial_bridge.py
```

Run the PC bridge from the project root after uploading one of those serial-only programs:

```powershell
python iot/nodemcu-esp8266-dht11/pc-serial-bridge/serial_bridge.py --port COM5 --api-url http://localhost:3000/mesures
```

Expected serial JSON:

```json
{"id_entrepot":1,"temperature":26.0,"humidite":55.0}
```
## Troubleshooting

- Do not use `localhost` in ESP8266 code. Use the PC IP address.
- If HTTP fails, allow port `3000` through Windows Firewall for your local network.
- If DHT readings fail, check VCC, GND, DATA, and make sure DATA is on `D4`.
- If `COM5` does not work, unplug/replug the board and check Device Manager.
