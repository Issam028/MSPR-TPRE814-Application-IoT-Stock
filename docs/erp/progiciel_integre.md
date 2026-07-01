# Intégration progiciel / ERP

## Objectif

La grille mentionne l'intégration dans un environnement de progiciel intégré. Le projet FutureKawa n'implémente pas SAP, Microsoft Dynamics ou Salesforce en production. En revanche, il ajoute un module d'intégration ERP concret côté API pays afin de démontrer la capacité à exposer des données métier dans un format consommable par un ERP.

Cette approche correspond au périmètre d'un POC MSPR : l'application métier reste spécifique à FutureKawa, mais elle prépare l'échange avec un système de gestion intégré.

## Module ajouté

Le module est situé dans :

```text
country/api/src/erp/
```

Il expose trois routes :

```text
GET /erp/health
GET /erp/stock-movements
GET /erp/quality-alerts
```

## Sécurité des exports

La route de supervision `/erp/health` reste publique afin de permettre un contrôle rapide de disponibilité.

Les routes d'export sont protégées par une clé API et un rôle :

```text
x-api-key: futurekawa-demo-key
x-user-role: stock
```

pour :

```text
GET /erp/stock-movements
```

et :

```text
x-api-key: futurekawa-demo-key
x-user-role: quality
```

pour :

```text
GET /erp/quality-alerts
```

Un rôle `admin` peut accéder aux deux exports. Un appel sans clé API ou avec un rôle incorrect reçoit une réponse HTTP 401.

## Correspondance ERP

| Besoin ERP | Route FutureKawa | Module ERP cible |
| --- | --- | --- |
| État des lots et stocks | `/erp/stock-movements` | Stock / Inventory |
| Non-conformités qualité | `/erp/quality-alerts` | Quality Management |
| Disponibilité du connecteur | `/erp/health` | Interface monitoring |

## Exemple stock

```json
{
  "erpSystem": "FutureKawa-ERP-Adapter",
  "erpModule": "STOCK",
  "externalId": "BR-LOT-12",
  "warehouseId": 3,
  "stockDate": "2026-06-30T12:00:00.000Z",
  "qualityStatus": "WARNING",
  "sourceStatus": "en alerte"
}
```

## Exemple qualité

```json
{
  "erpSystem": "FutureKawa-ERP-Adapter",
  "erpModule": "QUALITY",
  "externalId": "BR-MESURE-26407",
  "warehouseId": 1,
  "measuredAt": "2026-06-30T13:00:00.000Z",
  "temperature": 32.25,
  "humidity": 83.96,
  "qualityStatus": "NON_CONFORMITY",
  "sourceStatus": "en alerte"
}
```

## Positionnement

Le connecteur ne remplace pas un vrai déploiement SAP ou Dynamics. Il matérialise l'intégration attendue : transformation des données FutureKawa vers des objets métier ERP, séparation par module fonctionnel et endpoints dédiés à l'échange inter-applicatif.
