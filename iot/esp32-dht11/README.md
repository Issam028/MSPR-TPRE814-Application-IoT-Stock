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

In MicroPython this is:

```python
DHT_PIN = 32
```

## Recommended test: MicroPython USB serial bridge

Use this first. It works even if the ESP32 cannot connect directly to school WiFi.

The MicroPython file is:

```text
iot/esp32-dht11/micropython/main.py
```

It reads the DHT11 on GPIO32 and prints one JSON line every 10 seconds.

### Install MicroPython on the ESP32

You still need Windows to show a COM port for the ESP32. If Arduino IDE shows a blank port list, MicroPython tools will also fail until the USB cable or driver is fixed.

Install tools:

```powershell
python -m pip install esptool mpremote
```

Erase the ESP32:

```powershell
python -m esptool --chip esp32 --port COM5 erase_flash
```

Flash MicroPython firmware:

```powershell
python -m esptool --chip esp32 --port COM5 --baud 460800 write_flash -z 0x1000 ESP32_GENERIC-<version>.bin
```

Download the `ESP32_GENERIC` `.bin` firmware from the official MicroPython ESP32 download page, put it in the project folder, then use its real filename in the command above.

### Copy the project code to the ESP32

After MicroPython is installed:

```powershell
python -m mpremote connect COM5 fs cp iot/esp32-dht11/micropython/main.py :main.py
```

Then reset the ESP32:

```powershell
python -m mpremote connect COM5 reset
```

Watch the ESP32 output:

```powershell
python -m mpremote connect COM5
```

You should see lines like:

```json
{"id_entrepot":1,"temperature":26.0,"humidite":55.0}
```

### Send MicroPython readings to the project

Close `mpremote` first with `Ctrl+]`. Only one program can use `COM5` at a time.

Start the project:

```powershell
docker compose --profile dev up --build -d
```

Forward the ESP32 readings to the API:

```powershell
python iot/esp32-dht11/pc-serial-bridge/serial_bridge.py --port COM5 --api-url http://localhost:3000/mesures
```

## MicroPython direct WiFi version

Only use this if the ESP32 is connected to a simple WiFi network or phone hotspot.

Copy the example config:

```powershell
Copy-Item iot/esp32-dht11/micropython/config.example.py iot/esp32-dht11/micropython/config.py
```

Edit `config.py`, then copy the files:

```powershell
python -m mpremote connect COM5 fs cp iot/esp32-dht11/micropython/config.py :config.py
python -m mpremote connect COM5 fs cp iot/esp32-dht11/micropython/main_wifi.py :main.py
python -m mpremote connect COM5 reset
```

`API_URL` must use your PC IP address, not `localhost`, because the ESP32 has its own network connection. The school WiFi may not work if it uses enterprise authentication, so the USB serial bridge is usually easier.

## What the script does

- Reads temperature from the DHT11.
- Reads humidity from the DHT11.
- Sends or prints this JSON shape:

```json
{"id_entrepot":1,"temperature":26.0,"humidite":55.0}
```

The backend stores the measure and marks it `conforme` or `en alerte` using the existing project thresholds.
