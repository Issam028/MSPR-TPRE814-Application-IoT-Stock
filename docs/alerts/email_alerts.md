# Alertes email

## Objectif

La grille demande un mecanisme d'alerte et d'envoi d'email. Le projet implemente maintenant un service d'alerte cote API pays.

## Declenchement

Une alerte est declenchee dans deux cas :

- Mesure temperature/humidite hors seuil.
- Lot qui passe en statut `en alerte` ou `perime`.

Seuils mesures :

| Mesure | Conforme |
| --- | --- |
| Temperature | `24 C` a `30 C` |
| Humidite | `50 %` a `60 %` |

## Modes

La variable `ALERT_EMAIL_MODE` controle le comportement :

| Mode | Effet |
| --- | --- |
| `log` | Ecrit le contenu de l'email dans les logs Docker. Mode par defaut pour la demo. |
| `smtp` | Envoie un vrai email via SMTP. |
| `disabled` | Desactive les notifications. |

## Mode demo

Par defaut :

```env
ALERT_EMAIL_MODE=log
```

Tester une alerte :

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/mesures" -ContentType "application/json" -Body '{"id_entrepot":1,"temperature":34,"humidite":84}'
docker logs --tail 50 api_brazil
```

Resultat attendu :

```text
EMAIL ALERT LOG
Subject: [FutureKawa] Alerte entrepot 1
Temperature: 34 C
Humidite: 84 %
Statut: en alerte
```

## Mode SMTP reel

Exemple de variables :

```env
ALERT_EMAIL_MODE=smtp
ALERT_EMAIL_TO=responsable@example.com
ALERT_EMAIL_FROM=futurekawa-alerts@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=futurekawa-alerts@example.com
SMTP_PASS=CHANGE_ME
```

Les secrets SMTP ne doivent pas etre commits dans Git.
