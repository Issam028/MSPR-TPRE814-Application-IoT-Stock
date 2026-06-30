# Jenkins CI

This project includes a Jenkins pipeline at the repository root: `Jenkinsfile`.

## Goal

The pipeline verifies the main technical deliverables:

- Docker Compose configuration is valid.
- Country API builds.
- Central API builds.
- Frontend builds.
- MQTT bridge Docker image builds.

## Jenkins prerequisites

The Jenkins agent must have:

- Git
- Node.js and npm
- Docker
- Docker Compose plugin

## Pipeline stages

1. Checkout source code.
2. Run `docker compose --profile dev config`.
3. Run `npm ci` and `npm run build` in `country/api`.
4. Run `npm ci` and `npm run build` in `central/api`.
5. Run `npm ci` and `npm run build` in `central/app`.
6. Run `docker compose --profile dev build mqtt_bridge`.

## Local equivalent

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
cd ../../
docker compose --profile dev build mqtt_bridge
```

The project also keeps the existing GitHub Actions workflow for the country API. Jenkins is added to satisfy the MSPR requirement asking for a Jenkins pipeline.
