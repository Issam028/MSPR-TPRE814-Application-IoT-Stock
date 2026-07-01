# Dossier technique - FutureKawa IoT Stock

## Objectif

FutureKawa souhaite suivre les stocks de cafe et surveiller les conditions de stockage par entrepot. La solution centralise les donnees de plusieurs pays et permet de visualiser les lots, les mesures IoT et les alertes.

## Architecture globale

```text
ESP32 + DHT11
  -> WiFi
  -> Mosquitto MQTT broker
  -> mqtt_bridge
  -> API pays Brazil
  -> MySQL Brazil
  -> API centrale
  -> Frontend React
```

Architecture Docker :

```text
app_central: interface web React
api_central: API siege, agrege les APIs pays
api_brazil: API pays Brazil
api_colombia: API pays Colombia
api_ecuador: API pays Ecuador
mysql_Brazil: base SQL Brazil
mysql_Colombia: base SQL Colombia
mysql_Ecuador: base SQL Ecuador
mqtt_broker: broker Mosquitto local
mqtt_bridge: abonne MQTT qui persiste les mesures dans l'API pays
iot_simulator: simulateur de mesures pour tests rapides
```

## Flux IoT

1. Le capteur DHT11 mesure temperature et humidite.
2. L'ESP32 execute un script MicroPython dans Thonny.
3. L'ESP32 publie un message MQTT sur le topic `futurekawa/mesures`.
4. Mosquitto recoit le message.
5. `mqtt_bridge` lit le message MQTT.
6. `mqtt_bridge` transforme le message en requete HTTP `POST /mesures`.
7. L'API pays sauvegarde la mesure dans MySQL.
8. L'API centrale expose la mesure au frontend.
9. Le frontend affiche les cartes, l'historique, le graphe et les alertes.

Payload MQTT :

```json
{"id_entrepot":1,"temperature":26.5,"humidite":55}
```

## Choix techniques

| Besoin | Choix |
| --- | --- |
| Interface web | React + Vite |
| API | NestJS |
| Base de donnees | MySQL |
| Conteneurisation | Docker Compose |
| Communication IoT | MQTT avec Mosquitto |
| Microcontroleur | ESP32 |
| Capteur | DHT11 |
| Code embarque | MicroPython avec Thonny |
| Visualisation graphe | Recharts |

## Justification

- Docker Compose rend la demonstration reproductible sur un poste.
- L'API centrale reflete le siege et peut interroger plusieurs pays.
- Les APIs pays isolent les donnees locales.
- MQTT correspond au besoin IoT publish/subscribe et au cours.
- Le bridge MQTT evite de changer toute l'API existante : il relie le monde IoT au backend REST.
- MySQL assure la persistance des mesures, lots, entrepots et exploitations.

## Regles d'alerte

Une mesure est marquee `en alerte` si elle sort des seuils configures pour le pays :

| Pays | Temperature cible | Humidite cible | Tolerance |
| --- | --- | --- | --- |
| Brazil | `29 C` | `55 %` | `+/- 3 C`, `+/- 2 %` |
| Colombia | `26 C` | `80 %` | `+/- 3 C`, `+/- 2 %` |
| Ecuador | `31 C` | `60 %` | `+/- 3 C`, `+/- 2 %` |

Sinon, la mesure est `conforme`.

Les lots trop anciens peuvent aussi etre marques `perime` selon la date de stockage.

## Robustesse

- Les conteneurs sont relances automatiquement avec `restart: always`.
- Les bases MySQL utilisent des volumes Docker persistants.
- Le bridge MQTT reconnecte en boucle si la connexion au broker echoue.
- Les logs Docker permettent de diagnostiquer les flux MQTT et API.
- Le graphe frontend regroupe les mesures pour rester lisible meme avec beaucoup de donnees.

## Limites actuelles

- Les trois pays demandes sont exposes dans Docker Compose : Brazil, Colombia et Ecuador.
- L'envoi email reel des alertes depend d'un serveur SMTP externe ; le mode `log` permet de valider le contenu sans identifiants.
- La preuve du test ESP32 reel repose sur le scenario de seance et sur le scenario MQTT reproductible sans materiel.

## Commandes principales

Demarrer :

```powershell
docker compose --profile dev up --build -d
```

Tester MQTT sans ESP32 :

```powershell
docker exec mqtt_broker mosquitto_pub -h localhost -p 1883 -t futurekawa/mesures -m "{id_entrepot:1,temperature:26.5,humidite:55}"
docker logs --tail 30 mqtt_bridge
```

Verifier la derniere mesure :

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mesures/entrepot/1/latest"
```
