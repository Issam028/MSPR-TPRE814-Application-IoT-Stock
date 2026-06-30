# Plan de conduite du changement

## Objectif

Accompagner les equipes FutureKawa dans l'adoption de l'outil de supervision des stocks et des mesures IoT.

## Publics concernes

| Public | Besoin |
| --- | --- |
| Responsables d'exploitation | Suivre les alertes et l'etat des entrepots |
| Equipes entrepot | Comprendre les mesures et les actions attendues |
| Direction qualite | Controler la conformite de stockage |
| DSI / equipe technique | Maintenir l'application, les APIs et le flux MQTT |
| Direction siege | Superviser les pays et les indicateurs globaux |

## Axe 1 - Informer

Actions :

- Presenter le contexte du projet et les risques qualite lies au stockage.
- Expliquer les benefices : tracabilite, alertes, historique, centralisation.
- Diffuser une note de lancement aux responsables pays.

Livrables :

- Message de lancement.
- Schema simple du flux IoT.
- Planning de deploiement.

## Axe 2 - Communiquer

Actions :

- Organiser une courte demonstration de l'interface.
- Montrer un cas conforme et un cas en alerte.
- Partager les contacts support.

Canaux :

- Reunion Teams ou presentiel.
- README projet.
- Support PDF de soutenance.

## Axe 3 - Former

Actions :

- Former les responsables d'exploitation a la lecture du dashboard.
- Former les equipes techniques au redemarrage Docker et aux logs MQTT.
- Fournir une fiche reflexe en cas d'alerte.

Contenu formation :

- Selection pays / exploitation / entrepot.
- Lecture temperature et humidite.
- Consultation historique recent.
- Verification des logs `mqtt_bridge`.
- Procedure en cas de capteur hors ligne.

## Axe 4 - Faire participer

Actions :

- Recueillir les retours des utilisateurs apres la demonstration.
- Faire valider les seuils par les responsables metier.
- Identifier un referent par pays.
- Organiser un pilote sur un entrepot avant generalisation.

## Risques et reponses

| Risque | Reponse |
| --- | --- |
| Resistance au changement | Demonstration courte avec cas concret |
| Mauvaise interpretation des alertes | Formation + fiche reflexe |
| Capteur debranche ou WiFi instable | Procedure de diagnostic |
| Trop d'alertes | Ajustement progressif des seuils |
| Manque de confiance dans les donnees | Historique et logs consultables |

## Planning propose

1. Semaine 1 : presentation et validation du pilote.
2. Semaine 2 : installation sur un entrepot test.
3. Semaine 3 : collecte des retours terrain.
4. Semaine 4 : ajustements et preparation generalisation.

## Indicateurs de reussite

- Nombre d'alertes traitees.
- Temps moyen de reaction.
- Nombre de mesures recues par jour.
- Taux de disponibilite du flux MQTT.
- Satisfaction des responsables d'exploitation.
