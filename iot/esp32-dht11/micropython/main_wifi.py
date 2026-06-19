import json
import time

import dht
import network
import urequests
from machine import Pin

try:
    from config import API_URL, DHT_PIN, ENTREPOT_ID, INTERVAL_SECONDS, WIFI_PASSWORD, WIFI_SSID
except ImportError:
    WIFI_SSID = "CHANGE_ME"
    WIFI_PASSWORD = "CHANGE_ME"
    API_URL = "http://10.60.65.243:3000/mesures"
    ENTREPOT_ID = 1
    DHT_PIN = 32
    INTERVAL_SECONDS = 10


sensor = dht.DHT11(Pin(DHT_PIN))


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if not wlan.isconnected():
        print("Connecting to WiFi:", WIFI_SSID)
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)

        while not wlan.isconnected():
            print(".", end="")
            time.sleep(0.5)

    print()
    print("WiFi connected:", wlan.ifconfig()[0])


def read_payload():
    sensor.measure()
    return {
        "id_entrepot": ENTREPOT_ID,
        "temperature": sensor.temperature(),
        "humidite": sensor.humidity(),
    }


def post_payload(payload):
    response = urequests.post(
        API_URL,
        data=json.dumps(payload),
        headers={"Content-Type": "application/json"},
    )

    try:
        print("HTTP status:", response.status_code)
        print(response.text)
    finally:
        response.close()


print("FutureKawa ESP32 + DHT11 MicroPython WiFi")
connect_wifi()

while True:
    try:
        payload = read_payload()
        print(json.dumps(payload))
        post_payload(payload)
    except OSError as error:
        print("Sensor or network error:", error)

    time.sleep(INTERVAL_SECONDS)