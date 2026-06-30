# Plan de tests - FutureKawa IoT Stock

## Objectif

Valider que la solution permet de suivre les stocks et les conditions de stockage des entrepots, depuis un capteur IoT jusqu'a l'interface web.

## Prerequis

- Docker Desktop lance
- Projet place dans le dossier racine
- Port web disponible : `8080`
- Port API Brazil disponible : `3000`
- Port API central disponible : `3001`
- Port API Colombia disponible : `3002`
- Port API Ecuador disponible : `3003`
- Port MQTT disponible : `1883`

## Donnees de test

| Donnee | Valeur |
| --- | --- |
| Entrepot | `1` |
| Temperature conforme | `26.5` |
| Humidite conforme | `55` |
| Temperature alerte | `34` |
| Humidite alerte | `84` |
| Topic MQTT | `futurekawa/mesures` |

## T01 - Demarrage de la solution

Commande :

```powershell
docker compose --profile dev up --build -d
docker compose --profile dev ps
```

Resultat attendu :

- `api_brazil` est `Up`
- `api_colombia` est `Up`
- `api_ecuador` est `Up`
- `api_central` est `Up`
- `app_central` est `Up`
- `mqtt_broker` est `Up`
- `mqtt_bridge` est `Up`

## T02 - Test API mesure conforme

Commande :

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/mesures" -ContentType "application/json" -Body '{"id_entrepot":1,"temperature":26.5,"humidite":55}'
```

Resultat attendu :

- Code HTTP `201`
- Reponse avec `statut: conforme`
- Une mesure est creee en base de donnees

Verification :

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mesures/entrepot/1/latest"
```

## T03 - Test API mesure en alerte

Commande :

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/mesures" -ContentType "application/json" -Body '{"id_entrepot":1,"temperature":34,"humidite":84}'
```

Resultat attendu :

- Code HTTP `201`
- Reponse avec `statut: en alerte`
- L'alerte est visible dans l'interface

## T04 - Test MQTT sans ESP32

Objectif : prouver le flux MQTT meme sans materiel.

Commande :

```powershell
docker exec mqtt_broker mosquitto_pub -h localhost -p 1883 -t futurekawa/mesures -m "{id_entrepot:1,temperature:26.5,humidite:55}"
docker logs --tail 30 mqtt_bridge
```

Resultat attendu :

```text
mqtt: futurekawa/mesures {id_entrepot:1,temperature:26.5,humidite:55}
posted: 201 ...
```

Verification :

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mesures/entrepot/1/latest"
```

## T05 - Test ESP32 + DHT11 + MicroPython + MQTT

Objectif : prouver le fonctionnement reel du capteur.

Etapes :

1. Brancher le DHT11 sur l'ESP32 : `VCC -> 3V3`, `GND -> GND`, `DATA -> GPIO32`.
2. Ouvrir Thonny.
3. Choisir l'interpreteur `MicroPython (ESP32)`.
4. Enregistrer `config.py` sur la carte.
5. Enregistrer `iot/esp32-dht11/micropython/main_mqtt.py` sur la carte sous le nom `main.py`.
6. Redemarrer l'ESP32 avec le bouton `EN` ou `RST`.

Resultat attendu dans Thonny :

```text
WiFi connected: ...
MQTT connected: ... 1883
published: {"id_entrepot":1,"temperature":26,"humidite":55}
```

Resultat attendu dans Docker :

```powershell
docker logs -f mqtt_bridge
```

```text
mqtt: futurekawa/mesures ...
posted: 201 ...
```

## T06 - Test interface web

URL :

```text
http://localhost:8080
```

Etapes :

1. Ouvrir le Dashboard.
2. Selectionner `Bresil`.
3. Aller dans `Exploitations`.
4. Selectionner une exploitation puis l'entrepot `1`.
5. Verifier les cartes temperature et humidite.
6. Aller dans `Entrepots`.
7. Verifier l'historique recent des mesures.

Resultat attendu :

- La derniere temperature est affichee.
- La derniere humidite est affichee.
- Les alertes apparaissent si les seuils sont depasses.
- Le graphe reste lisible grace au regroupement des mesures.

## T07 - Test CI locale

Commandes :

```powershell
docker compose --profile dev config
cd country/api
npm ci
npm run build
cd ../../central/api
npm ci
npm run build
cd ../app
npm ci
npm run build
```

Resultat attendu :

- Les builds API et frontend passent.
- Le fichier `Jenkinsfile` reprend ces memes controles dans Jenkins.

## T08 - Test pays distribues

Objectif : verifier que le siege expose les trois pays demandes.

Commandes :

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/brazil/exploitations"
Invoke-RestMethod -Uri "http://localhost:3001/colombia/exploitations"
Invoke-RestMethod -Uri "http://localhost:3001/ecuador/exploitations"
```

Resultat attendu :

- Les trois endpoints repondent via l'API centrale.
- Les conteneurs `api_brazil`, `api_colombia` et `api_ecuador` sont actifs.

## Gestion des anomalies

| Anomalie | Correction |
| --- | --- |
| Port ESP32 absent | Changer cable USB, installer driver CP210x/CH340 |
| `COM6 access denied` | Fermer Thonny, Serial Monitor ou Python bridge |
| ESP32 ne publie pas | Verifier WiFi, `MQTT_BROKER`, pare-feu, meme reseau |
| MQTT recu mais non sauvegarde | Verifier logs `mqtt_bridge` et API Brazil |
| Interface web sans nouvelles donnees | Verifier API centrale, selection pays/entrepot, refresh navigateur |

## Statut

Le scenario MQTT sans ESP32 a ete valide avec le log `posted: 201`. Le scenario ESP32 reel a ete valide en seance avec Thonny et le capteur DHT11.
