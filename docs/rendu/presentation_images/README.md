# Images pour la soutenance MSPR TPRE814

Ce dossier contient les images propres a utiliser dans le support oral.

Une version du support generee avec ces images existe aussi ici :
`docs/rendu/MSPR_TPRE814_Thibault AUTEXIER - Issam HARNOUFI - Zaid ABABOU - Ali WARI_presentation_clean_images.pptx`.
Si le fichier PowerPoint principal est ouvert, il faut le fermer avant de relancer
`python docs/rendu/generate_presentation.py`, sinon Windows bloque l'ecriture.

| Fichier | Slide conseillee | Utilisation |
| --- | --- | --- |
| `00_contact_sheet_presentation_images.png` | Preparation | Vue rapide de toutes les images disponibles |
| `01_flux_donnees_futurekawa.png` | Architecture / flux | Nouveau diagramme propre du flux ESP32 -> MQTT -> APIs -> MySQL -> React |
| `02_dashboard_bresil.png` | Introduction / demo web | Dashboard siege avec selection du Bresil |
| `03_page_exploitations_bresil.png` | Interface web | Page exploitations avec jauges et graphe |
| `04_page_entrepots_bresil.png` | Interface web | Page entrepots avec lots, mesures et historique |
| `05_mcd_erd_futurekawa.png` | Base de donnees | MCD / ERD SQL reel du projet |
| `06_cablage_esp32_dht11.png` | IoT | Schema de cablage ESP32 + DHT11 |
| `07_thonny_micropython.png` | IoT / MicroPython | Script dans Thonny |
| `08_mqtt_bridge_log.png` | MQTT | Preuve du bridge MQTT vers API |
| `09_alerte_mail.png` | Alertes | Notification mail / preuve d'alerte |
| `10_erp_stock_movements.png` | ERP | Export ERP stock |
| `11_erp_quality_alerts.png` | ERP | Export ERP qualite |
| `12_jenkins_pipeline_vert.png` | Jenkins | Pipeline CI vert |
| `13_docker_services.png` | Docker | Services Docker actifs |
| `14_dashboard_equateur.png` | Multi-pays | Dashboard avec selection Equateur |

Images a eviter dans la soutenance :

- `docs/capture/ESP8266.jpg` : ce n'est pas la bonne carte pour le projet final ESP32.
- `docs/capture/image2.avif` : diagramme moins propre, avec fleches qui se croisent.

Si le jury demande une preuve supplementaire, les captures manuelles les plus utiles seraient :

1. Import reel du dataset avec `npm run dataset:import` lorsque Docker est lance.
2. Une requete SQL montrant les comptes `exploitations`, `entrepots`, `lots`, `mesures`.
3. Une capture Postman avec les headers ERP `x-api-key` et `x-user-role`.
