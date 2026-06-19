import time

import dht
import network
from machine import Pin
from umqtt.simple import MQTTClient

try:
    import ujson as json
except ImportError:
    import json

try:
    from config import (
        DHT_PIN,
        ENTREPOT_ID,
        INTERVAL_SECONDS,
        MQTT_BROKER,
        MQTT_CLIENT_ID,
        MQTT_PORT,
        MQTT_TOPIC,
        WIFI_PASSWORD,
        WIFI_SSID,
    )
except ImportError:
    WIFI_SSID = "CHANGE_ME"
    WIFI_PASSWORD = "CHANGE_ME"
    MQTT_BROKER = "10.60.65.243"
    MQTT_PORT = 1883
    MQTT_TOPIC = "futurekawa/mesures"
    MQTT_CLIENT_ID = "futurekawa-esp32-dht11"
    ENTREPOT_ID = 1
    DHT_PIN = 32
    INTERVAL_SECONDS = 10

sensor = dht.DHT11(Pin(DHT_PIN))


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if not wlan.isconnected():
        print("Connecting WiFi:", WIFI_SSID)
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)

        while not wlan.isconnected():
            print(".", end="")
            time.sleep(0.5)

    print()
    print("WiFi connected:", wlan.ifconfig()[0])
    return wlan


def connect_mqtt():
    client = MQTTClient(
        MQTT_CLIENT_ID.encode("utf-8"),
        MQTT_BROKER,
        port=MQTT_PORT,
        keepalive=60,
    )
    client.connect()
    print("MQTT connected:", MQTT_BROKER, MQTT_PORT)
    print("MQTT topic:", MQTT_TOPIC)
    return client


def read_payload():
    sensor.measure()
    return {
        "id_entrepot": ENTREPOT_ID,
        "temperature": sensor.temperature(),
        "humidite": sensor.humidity(),
    }


print("FutureKawa ESP32 + DHT11 MicroPython MQTT")
print("DHT11 data pin: GPIO{}".format(DHT_PIN))
connect_wifi()
mqtt = connect_mqtt()

while True:
    try:
        payload = read_payload()
        message = json.dumps(payload)
        mqtt.publish(MQTT_TOPIC.encode("utf-8"), message.encode("utf-8"))
        print("published:", message)
    except OSError as error:
        print("sensor/mqtt error:", error)
        try:
            mqtt.disconnect()
        except Exception:
            pass
        time.sleep(2)
        connect_wifi()
        mqtt = connect_mqtt()

    time.sleep(INTERVAL_SECONDS)