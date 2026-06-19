import json
import time

import dht
from machine import Pin


ENTREPOT_ID = 1
DHT_PIN = 32
INTERVAL_SECONDS = 10

sensor = dht.DHT11(Pin(DHT_PIN))


def read_payload():
    sensor.measure()
    return {
        "id_entrepot": ENTREPOT_ID,
        "temperature": sensor.temperature(),
        "humidite": sensor.humidity(),
    }


print("FutureKawa ESP32 + DHT11 MicroPython serial bridge")
print("DHT11 data pin: GPIO{}".format(DHT_PIN))

while True:
    try:
        print(json.dumps(read_payload()))
    except OSError as error:
        print("DHT11 read failed:", error)

    time.sleep(INTERVAL_SECONDS)