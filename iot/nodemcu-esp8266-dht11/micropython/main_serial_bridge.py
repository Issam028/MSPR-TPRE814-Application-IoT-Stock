import time
import ujson

import dht
import machine

try:
    from config import DHT_PIN, ENTREPOT_ID, INTERVAL_SECONDS
except ImportError:
    ENTREPOT_ID = 1
    DHT_PIN = 2
    INTERVAL_SECONDS = 10


sensor = dht.DHT11(machine.Pin(DHT_PIN))


def read_dht11():
    last_error = None

    for _ in range(3):
        try:
            sensor.measure()
            return {
                "id_entrepot": ENTREPOT_ID,
                "temperature": sensor.temperature(),
                "humidite": sensor.humidity(),
            }
        except Exception as error:
            last_error = error
            time.sleep(2)

    raise last_error


print("FutureKawa NodeMCU ESP8266 + DHT11 serial bridge")

while True:
    try:
        print(ujson.dumps(read_dht11()))
    except Exception as error:
        print("DHT11 read failed:", error)

    time.sleep(INTERVAL_SECONDS)