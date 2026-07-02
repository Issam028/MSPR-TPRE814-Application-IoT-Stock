# Stratégie de tests automatisés

## Objectif

Le projet combine tests manuels de démonstration et tests automatisés intégrés à Jenkins. Les tests automatisés couvrent les règles métier les plus critiques :

- calcul du statut d'une mesure ;
- respect des seuils température/humidité ;
- mapping des lots vers un payload ERP stock ;
- mapping des mesures en alerte vers un payload ERP qualité.

## Commande

```powershell
cd country/api
npm test
```

## Couverture actuelle

| Type de test | Statut | Preuve |
| --- | --- | --- |
| Tests unitaires métier | Couvert | `country/api/test/run-tests.ts` |
| Tests d'intégration API | Couvert manuellement | `docs/tests/plan_de_tests.md` |
| Tests MQTT | Couvert manuellement | publication `mosquitto_pub` et bridge |
| Tests UI | Couvert manuellement | dashboard, exploitations, entrepôts |
| Tests E2E | Couvert par scénario manuel | IoT/MQTT/API/MySQL/frontend |
| Re-test anomalie | Documenté | `docs/tests/anomalies_retests.md` |
| CI Jenkins | Couvert | `Jenkinsfile` |

## Positionnement E2E

Le dépôt contient un script Playwright utilisé pour capturer des preuves visuelles dans `docs/rendu/capture_evidence.py`. Ce script sert à documenter le rendu, mais il ne constitue pas encore une suite E2E automatisée intégrée au pipeline Jenkins.

Le scénario E2E actuel reste donc manuel :

1. démarrer la stack Docker ;
2. ouvrir le frontend ;
3. sélectionner un pays ;
4. consulter une exploitation ;
5. ouvrir le détail d'une alerte ;
6. vérifier que les données affichées correspondent aux réponses API.

L'étape suivante serait d'ajouter une vraie suite Playwright ou Cypress avec démarrage automatique des services de test, jeu de données contrôlé et exécution dans Jenkins.

## Rôle de Jenkins

Le pipeline Jenkins exécute :

1. validation Docker Compose sans affichage des secrets ;
2. installation des dépendances ;
3. tests automatisés de l'API pays ;
4. build API pays ;
5. build API centrale ;
6. contrôle TypeScript et build frontend ;
7. build frontend ;
8. build image MQTT bridge ;
9. archivage des artefacts.

## Limites

La couverture automatisée pourrait être étendue avec :

- tests HTTP end-to-end avec une base de test ;
- tests UI automatisés avec Playwright ;
- rapport de couverture ;
- analyse statique SonarQube.

Ces éléments sont des améliorations d'industrialisation. Le POC couvre déjà les règles métier centrales et les étapes CI attendues.
