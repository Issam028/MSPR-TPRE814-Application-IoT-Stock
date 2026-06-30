# MSPR deliverables

This folder groups the documents used for the final MSPR submission.

## Existing documents

- `api/api_documentation.md`: API routes.
- `tests/plan_de_tests.md`: manual and CI test plan.
- `ci/jenkins.md`: Jenkins pipeline documentation.
- `architecture/dossier_technique.md`: architecture and technical choices.
- `cadrage/questionnaire_phase_2.md`: interview questionnaire for phase 2.
- `changement/plan_conduite_changement.md`: change-management plan.
- `alerts/email_alerts.md`: email/log alert mechanism.

## Main demo flow

```text
ESP32 + DHT11
  -> WiFi
  -> Mosquitto MQTT broker
  -> mqtt_bridge
  -> country API
  -> MySQL
  -> central API
  -> React web interface
```
