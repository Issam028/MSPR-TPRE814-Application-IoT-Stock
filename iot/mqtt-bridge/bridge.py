import json
import os
import re
import time
import urllib.error
import urllib.request

import paho.mqtt.client as mqtt


MQTT_HOST = os.getenv("MQTT_HOST", "mqtt_broker")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "futurekawa/mesures")
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "futurekawa-mqtt-bridge")
API_URL = os.getenv("API_URL", "http://api_brazil:3000/mesures")


def parse_payload(payload):
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        # Demo shells on Windows can strip JSON quotes. Keep strict JSON support,
        # but tolerate {id_entrepot:1,temperature:26.5,humidite:55} for tests.
        relaxed_payload = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', payload)
        return json.loads(relaxed_payload)


def normalize_payload(payload):
    data = parse_payload(payload)
    return {
        "id_entrepot": int(data["id_entrepot"]),
        "temperature": float(data["temperature"]),
        "humidite": float(data["humidite"]),
    }


def post_measure(measure):
    body = json.dumps(measure).encode("utf-8")
    request = urllib.request.Request(
        API_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def on_connect(client, _userdata, _flags, reason_code, _properties):
    print("MQTT connected:", reason_code, flush=True)
    client.subscribe(MQTT_TOPIC)
    print("Subscribed to:", MQTT_TOPIC, flush=True)


def on_message(_client, _userdata, message):
    raw_payload = message.payload.decode("utf-8", errors="replace")
    print("mqtt:", message.topic, raw_payload, flush=True)

    try:
        measure = normalize_payload(raw_payload)
        status, response_body = post_measure(measure)
        print("posted:", status, response_body, flush=True)
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
        print("invalid payload:", error, flush=True)
    except (urllib.error.URLError, TimeoutError) as error:
        print("api error:", error, flush=True)


def run():
    while True:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=MQTT_CLIENT_ID)
        client.on_connect = on_connect
        client.on_message = on_message

        try:
            print("Connecting MQTT:", MQTT_HOST, MQTT_PORT, flush=True)
            client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
            client.loop_forever()
        except Exception as error:
            print("bridge error:", error, flush=True)
            time.sleep(5)


if __name__ == "__main__":
    run()