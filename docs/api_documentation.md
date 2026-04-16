# API Documentation

This document lists the HTTP routes found in the `central` and `country` APIs (controller files).

## Central API (central/api)

- Resource: `lots` — controller: [central/api/src/lots/lots.controller.ts](central/api/src/lots/lots.controller.ts)
  - GET /lots — list all lots (findAll)
  - GET /lots/:id — get one lot (findOne)
  - POST /lots — create a lot (create)
  - PUT /lots/:id — update a lot (update)
  - DELETE /lots/:id — delete a lot (remove) — returns HTTP 204

- Resource: `mesures` — controller: [central/api/src/mesures/mesures.controller.ts](central/api/src/mesures/mesures.controller.ts)
  - GET /mesures — list all mesures (findAll)
  - GET /mesures/entrepot/:id — mesures by entrepot (findByEntrepot)
  - GET /mesures/:id — get one mesure (findOne)
  - POST /mesures — create a mesure (create)

## Country API (country/api)

- Resource: `lots` — controller: [country/api/src/lots/lots.controller.ts](country/api/src/lots/lots.controller.ts)
  - GET /lots — list all lots (findAll)
  - GET /lots/:id — get one lot (findOne)
  - POST /lots — create a lot (create)
  - PUT /lots/:id — update a lot (update)
  - DELETE /lots/:id — delete a lot (remove) — returns HTTP 204

- Resource: `mesures` — controller: [country/api/src/mesures/mesures.controller.ts](country/api/src/mesures/mesures.controller.ts)
  - GET /mesures — list all mesures (findAll)
  - GET /mesures/entrepot/:id — mesures by entrepot (findByEntrepot)
  - GET /mesures/:id — get one mesure (findOne)
  - POST /mesures — create a mesure (create)

