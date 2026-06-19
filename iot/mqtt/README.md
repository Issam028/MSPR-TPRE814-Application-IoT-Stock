# MQTT IoT bridge

This folder adds the MQTT path expected by the IoT course:

ESP32 + DHT11 -> WiFi -> Mosquitto broker -> MQTT bridge -> country API -> MySQL -> web app

## Services

- `mqtt_broker`: local Mosquitto broker on port `1883`
- `mqtt_bridge`: subscribes to `futurekawa/mesures` and posts each measure to `http://api_brazil:3000/mesures`

## Start

```powershell
docker compose --profile dev up --build -d mqtt_broker mqtt_bridge api_brazil api_central app_central
```

Watch incoming MQTT messages and database posts:

```powershell
docker logs -f mqtt_bridge
```

## Test without ESP32

The ESP32 sends strict JSON. For a quick PowerShell demo, this relaxed payload avoids Windows quote escaping problems and is accepted by the bridge:

```powershell
docker exec mqtt_broker mosquitto_pub -h localhost -p 1883 -t futurekawa/mesures -m "{id_entrepot:1,temperature:26.5,humidite:55}"
```

Expected bridge log:

```text
mqtt: futurekawa/mesures {id_entrepot:1,temperature:26.5,humidite:55}
posted: 201 ...
```

Then check the saved value:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mesures/entrepot/1/latest"
```

## ESP32 topic and payload

Topic:

```text
futurekawa/mesures
```

Payload sent by `main_mqtt.py`:

```json
{"id_entrepot":1,"temperature":26.5,"humidite":55}
```

## Port choice

The teacher example uses `listener 3000`, but this project already uses port `3000` for the Brazil API. MQTT uses `1883` here, which is the standard MQTT port and avoids the conflict.