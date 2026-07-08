# Notes orales - MSPR TPRE814 FutureKawa

Durée cible : 20 minutes. Parle naturellement : l'objectif est de raconter le projet, pas de lire les slides.

1. Introduction : rappeler le besoin FutureKawa et annoncer le fil rouge : stock, IoT, alertes, preuves.
2. Contexte : insister sur la traçabilité et la qualité du stockage du café vert.
3. Solution livrée : expliquer les 3 blocs, siège, pays, IoT.
4. Architecture : décrire le chemin de la donnée de l'entrepôt jusqu'au dashboard.
5. Docker : montrer que tout est reproductible localement.
6. Base de données : expliquer les relations et le dataset réellement trouvé.
7. IoT : dire que le prototype ESP32/DHT11 publie via MQTT.
8. MQTT : expliquer le bridge vers l'API pays.
9. Interface : montrer les pages comme preuve métier.
10. Alertes : expliquer pourquoi une alerte renvoie au contexte d'exploitation.
11. ERP : être honnête : adaptateur simulé POC, pas SAP réel.
12. Tests/Jenkins : insister sur tests automatisés + pipeline vert.
13. Limites : dire ce qui reste industriel : JWT, ERP réel, E2E navigateur, supervision.
14. Conclusion : résumer en une phrase : la chaîne de supervision est démontrable, documentée et vérifiée.
