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
3. Ouvrir l'application sur `http://localhost:80`

### Arrêt
- Stopper les services avec `Ctrl + C`
- Ou exécuter `docker compose down`

### Ce que fait le simulateur
- Envoie un `POST /mesures` avec `id_entrepot`, `temperature` et `humidite`.
- Tourne en boucle avec un intervalle configurable.
- Peut produire des valeurs normales ou des valeurs d'alerte via `SIMULATOR_MODE`.