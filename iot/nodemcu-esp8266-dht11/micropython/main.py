import gc
import time

import dht
import machine
import network
import ujson
import urequests

try:
    from config import (
        API_URL,
        DHT_PIN,
        ENTREPOT_ID,
        INTERVAL_SECONDS,
        WIFI_PASSWORD,
        WIFI_SSID,
    )
except ImportError:
    WIFI_SSID = "CHANGE_ME"
    WIFI_PASSWORD = "CHANGE_ME"
    API_URL = "http://10.60.65.243:3000/mesures"
    ENTREPOT_ID = 1
    DHT_PIN = 2
    INTERVAL_SECONDS = 10


sensor = dht.DHT11(machine.Pin(DHT_PIN))


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("WiFi already connected:", wlan.ifconfig())
        return wlan

    print("Connecting to WiFi:", WIFI_SSID)
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    for attempt in range(30):
        if wlan.isconnected():
            print("WiFi connected:", wlan.ifconfig())
            return wlan

        print("Waiting for WiFi", attempt + 1, "/ 30")
        time.sleep(1)

    raise RuntimeError("WiFi connection failed")


def read_dht11():
    last_error = None

    for _ in range(3):
        try:
            sensor.measure()
            temperature = sensor.temperature()
            humidite = sensor.humidity()

            return {
                "id_entrepot": ENTREPOT_ID,
                "temperature": temperature,
                "humidite": humidite,
            }
        except Exception as error:
            last_error = error
            time.sleep(2)

    raise last_error


def post_mesure(payload):
    response = None

    try:
        response = urequests.post(
            API_URL,
            data=ujson.dumps(payload),
            headers={"Content-Type": "application/json"},
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
    print("FutureKawa NodeMCU ESP8266 + DHT11")
    print("API:", API_URL)
    print("Entrepot:", ENTREPOT_ID)
    print("DHT GPIO:", DHT_PIN)

    connect_wifi()

    while True:
        try:
            payload = read_dht11()
            post_mesure(payload)
        except Exception as error:
            print("IoT send failed:", error)

        gc.collect()
        time.sleep(INTERVAL_SECONDS)


main()
