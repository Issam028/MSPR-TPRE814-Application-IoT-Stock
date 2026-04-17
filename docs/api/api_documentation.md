# API Documentation

## API CENTRALE
**Base:** `http://central-api:PORT`  
**Préfixe:** `/:country` (brazil / colombia)

### EXPLOITATIONS
- `GET /:country/exploitations` — Toutes les exploitations
- `GET /:country/exploitations/:id` — Une exploitation
- `POST /:country/exploitations` → `{ "nom": "Finca La Esperanza" }`
- `PUT /:country/exploitations/:id` → `{ "nom": "Nom mis à jour" }`
- `DELETE /:country/exploitations/:id`

### ENTREPOTS
- `GET /:country/entrepots` — Tous les entrepôts
- `GET /:country/entrepots/:id` — Un entrepôt
- `POST /:country/entrepots` → `{ "id_exploitation": 1, "nom": "Entrepôt Nord" }`
- `PUT /:country/entrepots/:id` → `{ "nom": "Nom mis à jour" }`
- `DELETE /:country/entrepots/:id`

### LOTS
- `GET /:country/lots` — Tous les lots
- `GET /:country/lots/:id` — Un lot
- `POST /:country/lots` → `{ "id_entrepot": 1, "date_stockage": "2025-01-01T00:00:00Z", "statut": "conforme" }`
- `PUT /:country/lots/:id` → `{ "id_entrepot": 1, "statut": "en alerte" }`
- `DELETE /:country/lots/:id`

### MESURES
- `GET /:country/mesures` — Toutes les mesures
- `GET /:country/mesures/entrepot/:id` — Mesures d'un entrepôt
- `GET /:country/mesures/:id` — Une mesure
- `POST /:country/mesures` → `{ "id_entrepot": 1, "temperature": 22.5, "humidite": 65.3 }`

---

## API PAYS
**Base:** `http://country-api:PORT`

### EXPLOITATIONS
- `GET /exploitations` — Toutes les exploitations
- `GET /exploitations/:id` — Une exploitation
- `POST /exploitations` → `{ "nom": "Finca La Esperanza" }`
- `PUT /exploitations/:id` → `{ "nom": "Nom mis à jour" }`
- `DELETE /exploitations/:id`

### ENTREPOTS
- `GET /entrepots` — Tous les entrepôts
- `GET /entrepots/exploitation/:id` — Entrepôts d'une exploitation
- `GET /entrepots/:id` — Un entrepôt
- `POST /entrepots` → `{ "id_exploitation": 1, "nom": "Entrepôt Nord" }`
- `PUT /entrepots/:id` → `{ "nom": "Nom mis à jour" }`
- `DELETE /entrepots/:id`

### LOTS
- `GET /lots` — Tous les lots
- `GET /lots/expired` — Lots périmés
- `GET /lots/:id` — Un lot
- `POST /lots` → `{ "id_entrepot": 1, "date_stockage": "2025-01-01T00:00:00Z" }`
- `PUT /lots/:id` → `{ "statut": "conforme" }`
- `DELETE /lots/:id`

### MESURES
- `GET /mesures` — Toutes les mesures
- `GET /mesures/entrepot/:id` — Mesures d'un entrepôt
- `GET /mesures/alerts` — Mesures en alerte
- `GET /mesures/:id` — Une mesure
- `POST /mesures` → `{ "id_entrepot": 1, "temperature": 22.5, "humidite": 65.3 }`


