# Suivi des anomalies, corrections et re-tests

## Objectif

Ce document formalise la gestion des anomalies observées pendant le développement. Il répond au besoin de constater un problème, corriger, puis re-tester.

| ID | Anomalie constatée | Impact | Correction réalisée | Re-test | Statut |
| --- | --- | --- | --- | --- | --- |
| ANO-001 | Le graphe Exploitations affichait trop de points et devenait illisible | L'utilisateur ne pouvait pas analyser l'évolution température/humidité | Limitation des mesures, regroupement par buckets, moyenne par bucket, domaine Y adapté | Rechargement page Exploitations avec historique dense | Corrigée |
| ANO-002 | Scroll horizontal disgracieux sur la page Entrepôts | Expérience utilisateur dégradée | Ajustement CSS pour contenir les tableaux/cartes dans la largeur disponible | Test desktop sur page Entrepôts | Corrigée |
| ANO-003 | Alertes visibles mais peu contextualisées | L'utilisateur ne comprenait pas rapidement la cause | Alertes cliquables vers Exploitations/Entrepôts avec contexte métier | Clic sur une alerte depuis dashboard/pages métier | Corrigée |
| ANO-004 | Jenkins échouait à cause de l'option `ansiColor` absente | Pipeline bloqué | Suppression de l'option non disponible dans Jenkins local | Relance Jenkins après commit | Corrigée |
| ANO-005 | Jenkins échouait si Docker n'était pas disponible dans l'environnement | Pipeline non exécutable sur certains postes | Documentation du prérequis Docker et validation Docker Compose explicite | Relance après correction environnement Docker | Corrigée |
| ANO-006 | Port série ESP32 bloqué par le Serial Monitor | Bridge Python impossible à lancer | Fermeture du Serial Monitor avant lancement du bridge | Relance `serial_bridge.py --port COM6` | Corrigée |
| ANO-007 | Preuve ERP trop théorique | Risque sur le critère progiciel intégré | Ajout d'un module `/erp` avec export stock et qualité | Build API + tests automatisés du mapping ERP | Corrigée |

## Méthode de re-test

Chaque correction est validée par au moins une action de re-test :

- build applicatif ;
- test automatisé ;
- commande API ;
- vérification interface ;
- relance Jenkins ;
- vérification des logs.

Cette méthode permet de montrer une démarche structurée : constater, corriger, vérifier.
