# MSPR TPRE814 - Conception d'une solution applicative en adéquation avec l'environnement technique étudié

## Description
Ce projet consiste à concevoir et développer une solution applicative permettant de suivre les stocks de café et de surveiller les conditions de stockage (température, humidité) grâce à un système IoT.

## Objectifs
- Suivi des lots de café
- Surveillance automatique des conditions de stockage
- Détection des anomalies
- Centralisation des données
- Visualisation via une interface web

## Travail réalisé
- Mise en place d'un simulateur IoT pour envoyer des mesures de température et d'humidité sans Arduino réel.
- Réception et stockage des mesures dans l'API `country` et la base MySQL.
- Ajout d'un statut d'alerte pour les mesures : `conforme` ou `en alerte`.
- Ajout du statut des lots : `conforme`, `en alerte` ou `périmé` selon la date de stockage.
- Mise en place d'un démarrage Docker avec `docker compose --profile dev up --build`.
- Ajout d'un pipeline GitHub Actions pour vérifier le build de l'API `country`.
- Ajout d'un flux CI/CD GitHub Actions pour construire et publier l'image Docker de l'API `country`.

## Mode simulation
Le projet peut tourner sans Arduino grâce à un simulateur léger qui envoie des mesures fictives vers l'API `country`.

### Lancement
1. Copier [`.env.example`](.env.example) vers `.env` si vous voulez personnaliser les ports ou les variables.
2. Lancer les services avec le profil `dev` : `docker compose --profile dev up --build`
3. Ouvrir l'application sur `http://localhost:8080`

### Commandes terminal
Depuis PowerShell, se placer dans le dossier du projet :

```powershell
cd "C:\Users\reyis\Desktop\Projects\MSPR-TPRE814-Application-IoT-Stock"
```

Lancer l'application avec la simulation IoT :

```powershell
docker compose --profile dev up --build -d
```

Voir les valeurs envoyees par le simulateur IoT :

```powershell
docker logs -f iot_simulator
```

Envoyer une mesure IoT manuelle vers l'API `country` :

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/mesures" -ContentType "application/json" -Body '{"id_entrepot":1,"temperature":26.5,"humidite":55}'
```

Envoyer une mesure en alerte :

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/mesures" -ContentType "application/json" -Body '{"id_entrepot":1,"temperature":34,"humidite":84}'
```

### Arrêt
- Stopper les services avec `Ctrl + C`
- Ou exécuter `docker compose down`

### Ce que fait le simulateur
- Envoie un `POST /mesures` avec `id_entrepot`, `temperature` et `humidite`.
- Tourne en boucle avec un intervalle configurable.
- Peut produire des valeurs normales ou des valeurs d'alerte via `SIMULATOR_MODE`.

### Version MicroPython
Le dossier [`simulator/micropython`](simulator/micropython) contient une version MicroPython du simulateur IoT.

Cette version represente le code qui pourrait tourner sur une carte ESP32, ESP8266 ou Raspberry Pi Pico W. Elle se connecte au WiFi, genere des mesures fictives, puis envoie un `POST /mesures` vers l'API `country`.

Le simulateur Docker reste utile pour les tests locaux rapides, tandis que la version MicroPython montre la partie "objet connecte" attendue dans un contexte IoT.

### Version materiel reel : NodeMCU ESP8266 + DHT11
Le dossier [`iot/nodemcu-esp8266-dht11`](iot/nodemcu-esp8266-dht11) contient l'integration pour le vrai capteur DHT11 branche sur une carte NodeMCU ESP8266.

Cette version lit la temperature et l'humidite du capteur, puis envoie les mesures vers l'API `country` avec `POST /mesures`. Une version MicroPython et une version Arduino IDE sont fournies.

### Version materiel reel : ESP32 + DHT11
Le dossier [`iot/esp32-dht11`](iot/esp32-dht11) contient l'integration adaptee au materiel reel utilise maintenant : une carte ESP32 avec un capteur DHT11.

Branchement utilise :

- DHT11 `VCC / +` vers ESP32 `3V3`
- DHT11 `GND / -` vers ESP32 `GND`
- DHT11 `OUT / DATA` vers ESP32 `GPIO32`

Le fichier MicroPython principal est [`iot/esp32-dht11/micropython/main.py`](iot/esp32-dht11/micropython/main.py). Il lit le capteur et affiche les mesures en JSON sur le port USB serie.

Pour envoyer les mesures au backend :

```powershell
python iot/esp32-dht11/pc-serial-bridge/serial_bridge.py --port COM5 --api-url http://localhost:3000/mesures
```
