# MicroPython IoT simulator

This folder contains the embedded-device version of the fake IoT simulation.

The project already has a Docker/Node.js simulator in `simulator/index.js` for local testing. This `main.py` file is the version that can be shown as MicroPython code for an ESP32, ESP8266, or Raspberry Pi Pico W.

## What it does

- Connects to WiFi.
- Creates fake temperature and humidity readings.
- Sends a JSON `POST` request to the `country` API endpoint: `/mesures`.
- Uses the same payload as the backend expects:

```json
{
  "id_entrepot": 1,
  "temperature": 26.5,
  "humidite": 55
}
```

## Before running

Edit these values in `main.py`:

```python
WIFI_SSID = "CHANGE_ME"
WIFI_PASSWORD = "CHANGE_ME"
API_URL = "http://192.168.1.42:3000/mesures"
```

Important: on a real microcontroller, `localhost` means the microcontroller itself. Use the IP address of the computer running Docker instead.

## Modes

```python
MODE = "normal"
MODE = "alert"
MODE = "mixed"
```

`normal` sends conforming values, `alert` sends out-of-range values, and `mixed` sends mostly normal values with some alerts.
