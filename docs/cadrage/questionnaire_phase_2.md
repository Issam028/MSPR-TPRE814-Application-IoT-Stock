# Questionnaire d'interview - Phase 2 automatisation

## Objectif

Preparer la phase 2 : automatiser les entrepots avec chauffage, humidification et aeration pilotes par les mesures temperature/humidite.

## Questions metier

1. Quels entrepots sont prioritaires pour l'automatisation ?
2. Quels lots sont les plus sensibles aux variations de temperature et d'humidite ?
3. Quelles plages de temperature sont acceptables par pays ?
4. Quelles plages d'humidite sont acceptables par pays ?
5. Combien de temps une alerte peut-elle rester non traitee avant escalation ?
6. Qui est responsable de la validation d'une alerte ?
7. Quels indicateurs doivent apparaitre dans le tableau de bord siege ?
8. Les responsables locaux doivent-ils pouvoir modifier les seuils ?

## Questions securite

1. Quelles actions automatiques sont autorisees sans validation humaine ?
2. Faut-il un bouton d'arret manuel sur site ?
3. Que faire si le capteur renvoie une valeur incoherente ?
4. Que faire si le WiFi ou le broker MQTT tombe ?
5. Quels logs doivent etre conserves pour audit ?
6. Combien de temps conserver les historiques de mesures ?

## Questions maintenance

1. Qui remplace les capteurs defectueux ?
2. A quelle frequence faut-il calibrer les capteurs ?
3. Qui gere les mises a jour des ESP32 ?
4. Quel niveau de support est attendu par pays ?
5. Faut-il un stock de capteurs de secours ?

## Questions deploiement

1. Commence-t-on par un pilote sur un seul entrepot ?
2. Quels criteres permettent de valider le pilote ?
3. Quels pays passent en production en premier ?
4. Quelle formation est necessaire pour les equipes terrain ?
5. Comment informer les responsables d'exploitation des nouvelles procedures ?

## Resultats attendus de l'interview

- Liste des seuils par pays.
- Priorisation des entrepots.
- Regles d'escalade des alertes.
- Limites de l'automatisation.
- Responsabilites metier et techniques.
- Planning de deploiement progressif.
