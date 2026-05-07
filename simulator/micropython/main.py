import network
import random
import time
import ujson
import urequests


# MicroPython fake IoT sensor for FutureKawa.
# Copy this file to an ESP32, ESP8266, or Raspberry Pi Pico W as main.py.

WIFI_SSID = "CHANGE_ME"
WIFI_PASSWORD = "CHANGE_ME"

# Use the IP address of the computer running Docker, not localhost.
# Example: http://192.168.1.42:3000/mesures
API_URL = "http://192.168.1.42:3000/mesures"

ENTREPOT_ID = 1
INTERVAL_SECONDS = 5

# Available modes: normal, alert, mixed
MODE = "mixed"


def random_between(min_value, max_value):
    min_int = int(min_value * 100)
    max_int = int(max_value * 100)
    return random.randint(min_int, max_int) / 100


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if not wlan.isconnected():
        print("Connecting to WiFi...")
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)

        for _ in range(30):
            if wlan.isconnected():
                break
            time.sleep(1)

    if not wlan.isconnected():
        raise RuntimeError("WiFi connection failed")

    print("WiFi connected:", wlan.ifconfig())


def normal_reading():
    return {
        "id_entrepot": ENTREPOT_ID,
        "temperature": random_between(25, 29),
        "humidite": random_between(50, 60),
    }


def alert_reading():
    return {
        "id_entrepot": ENTREPOT_ID,
        "temperature": random_between(32, 36),
        "humidite": random_between(78, 90),
    }


def build_reading():
    mode = MODE.lower()

    if mode == "normal":
        return normal_reading()

    if mode == "alert":
        return alert_reading()

    # Mixed mode: about 20 percent alert values.
    if random.randint(1, 10) <= 2:
        return alert_reading()

    return normal_reading()


def send_reading(payload):
    response = None
    headers = {"Content-Type": "application/json"}

    try:
        response = urequests.post(
            API_URL,
            data=ujson.dumps(payload),
            headers=headers,
        )
        print(
            "Sent",
            payload["temperature"],
            "C /",
            payload["humidite"],
            "% -> HTTP",
            response.status_code,
        )
    finally:
        if response:
            response.close()


def main():
    connect_wifi()

    while True:
        try:
            send_reading(build_reading())
        except Exception as error:
            print("Send failed:", error)

        time.sleep(INTERVAL_SECONDS)


main()
