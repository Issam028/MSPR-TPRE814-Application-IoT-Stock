# MSPR TPRE814 - Conception d'une solution applicative en adéquation avec l'environnement technique étudié

## Description
Ce projet consiste à concevoir et développer une solution applicative permettant de suivre les stocks de café et de surveiller les conditions de stockage (température, humidité) grâce à un système IoT.

## Objectifs
- Suivi des lots de café
- Surveillance automatique des conditions de stockage
- Détection des anomalies
- Centralisation des données
- Visualisation via une interface web

## Mode simulation
Le projet peut tourner sans Arduino grâce à un simulateur léger qui envoie des mesures fictives vers l'API `country`.

### Lancement
1. Copier [`.env.example`](.env.example) vers `.env` si vous voulez personnaliser les ports ou les variables.
2. Lancer les services avec le profil `dev` : `docker compose --profile dev up --build`
3. Ouvrir l'application sur `http://localhost:80`

### Arrêt
- Stopper les services avec `Ctrl + C`
- Ou exécuter `docker compose down`

### Ce que fait le simulateur
- Envoie un `POST /mesures` avec `id_entrepot`, `temperature` et `humidite`.
- Tourne en boucle avec un intervalle configurable.
- Peut produire des valeurs normales ou des valeurs d'alerte via `SIMULATOR_MODE`.