# ESP32 + DHT11 real sensor

This folder is for the real hardware and follows the IoT course direction:

- IDE: Thonny
- Firmware: MicroPython on ESP32
- Sensor: DHT11 temperature and humidity
- Protocol: MQTT through Mosquitto
- Backend save: MQTT bridge posts to `POST /mesures`

## Wiring

| DHT11 pin | ESP32 pin |
| --- | --- |
| VCC / + | 3V3 |
| GND / - | GND |
| OUT / DATA | GPIO32 |

In MicroPython this is:

```python
DHT_PIN = 32
```

## Recommended path: Thonny + MicroPython + MQTT

This is the version closest to the teacher examples: `network`, `umqtt.simple`, `dht`, `Pin(32)`.

MicroPython files:

```text
iot/esp32-dht11/micropython/main_mqtt.py
iot/esp32-dht11/micropython/config.example.py
```

### 1. Start the project MQTT services

```powershell
docker compose --profile dev up --build -d mqtt_broker mqtt_bridge api_brazil api_central app_central
```

Optional: stop the fake simulator so only ESP32 data arrives:

```powershell
docker compose stop iot_simulator
```

Watch the MQTT bridge:

```powershell
docker logs -f mqtt_bridge
```

### 2. Find your PC IP address

The ESP32 cannot use `localhost`. It must use your PC IPv4 address on the same WiFi or hotspot.

```powershell
ipconfig
```

Use the IPv4 address in `MQTT_BROKER`.

### 3. Prepare the config file

```powershell
Copy-Item iot/esp32-dht11/micropython/config.example.py iot/esp32-dht11/micropython/config.py
```

Edit `config.py`:

```python
WIFI_SSID = "YOUR_WIFI_OR_HOTSPOT"
WIFI_PASSWORD = "YOUR_PASSWORD"
MQTT_BROKER = "YOUR_PC_IPV4"
MQTT_PORT = 1883
MQTT_TOPIC = "futurekawa/mesures"
ENTREPOT_ID = 1
DHT_PIN = 32
```

If school WiFi blocks devices, use a phone hotspot or Windows hotspot.

### 4. Use Thonny

1. Open Thonny.
2. Tools > Options > Interpreter.
3. Select MicroPython ESP32.
4. Select the ESP32 port, usually `COM6`.
5. If needed: Install or update MicroPython.
6. Open `config.py`, save it to the device as `config.py`.
7. Open `main_mqtt.py`, save it to the device as `main.py`.
8. Press the ESP32 `EN` or `RST` button.

Expected Thonny console:

```text
FutureKawa ESP32 + DHT11 MicroPython MQTT
WiFi connected: ...
MQTT connected: ... 1883
published: {"id_entrepot":1,"temperature":26,"humidite":55}
```

Expected Docker log:

```text
mqtt: futurekawa/mesures {"id_entrepot":1,"temperature":26,"humidite":55}
posted: 201 ...
```

### 5. Check database/API

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mesures/entrepot/1/latest"
```

## Alternative: USB serial bridge

Use this only if WiFi/MQTT is blocked. It reads DHT11 and prints JSON over USB, then the PC forwards it to the API.

```powershell
python iot/esp32-dht11/pc-serial-bridge/serial_bridge.py --port COM6 --api-url http://localhost:3000/mesures
```

## Alternative: Arduino IDE

The Arduino sketches still exist, but for the MSPR grid and the teacher's IoT lesson, the MicroPython + MQTT version is the one to present first.

```text
iot/esp32-dht11/arduino/ESP32_DHT11_SerialBridge/ESP32_DHT11_SerialBridge.ino
iot/esp32-dht11/arduino/ESP32_DHT11_FutureKawa/ESP32_DHT11_FutureKawa.ino
```