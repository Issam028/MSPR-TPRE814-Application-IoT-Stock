# Adaptateur ERP simulé dans le cadre du POC

## Objectif

La grille mentionne l'intégration dans un environnement de progiciel intégré. Le projet FutureKawa n'implémente pas SAP, Microsoft Dynamics ou Salesforce en production. Il ajoute en revanche un adaptateur ERP simulé côté API pays afin de démontrer la capacité à exposer des données métier dans un format consommable par un ERP.

Cette approche correspond au périmètre d'un POC MSPR : l'application métier reste spécifique à FutureKawa, mais elle prépare l'échange avec un système de gestion intégré. Il ne s'agit pas d'un développement ABAP, X++, Apex ou d'une extension native d'un progiciel éditeur.

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

## Niveau de réalisation

| Élément | Réalisé dans le POC | Limite | Évolution industrielle |
| --- | --- | --- | --- |
| Connecteur ERP | Routes `/erp/health`, `/erp/stock-movements`, `/erp/quality-alerts` | Pas de connexion à un ERP réel | Connecteur SAP/Dynamics/Salesforce via API officielle |
| Format d'échange | Payloads JSON stock et qualité | Pas de flux CSV industriel, EDI ou IDoc | Ajouter les formats attendus par le progiciel cible |
| Sécurité | Clé API et rôle simple | Pas de JWT/SSO complet | OAuth2, SSO, rotation des clés, audit |
| Langage progiciel | Mapping applicatif en NestJS | Pas d'ABAP, X++, Apex | Développement natif selon l'ERP retenu |
| Synchronisation | Exports lecture seule | Pas de flux retour ERP | Synchronisation bidirectionnelle, accusés de réception, reprise sur erreur |

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

L'adaptateur ne remplace pas un vrai déploiement SAP, Microsoft Dynamics ou Salesforce. Il matérialise l'intégration attendue à l'échelle du POC : transformation des données FutureKawa vers des objets métier ERP, séparation par module fonctionnel et endpoints dédiés à l'échange inter-applicatif.
