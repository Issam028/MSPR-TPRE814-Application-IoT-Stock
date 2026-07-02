# Import du jeu de donnees SQL

## Jeu de donnees identifie dans le depot

La recherche dans le depot a trouve les fichiers de donnees SQL suivants :

| Fichier | Format | Role | Lignes de donnees detectees | Utilisation actuelle avant importeur |
| --- | --- | --- | --- | --- |
| `docs/data_tests/exploitations.sql` | SQL `INSERT` | Exploitations | 2 | Non monte automatiquement dans Docker Compose |
| `docs/data_tests/entrepots.sql` | SQL `INSERT` | Entrepots | 7 | Non monte automatiquement dans Docker Compose |
| `docs/data_tests/mesures.sql` | SQL `INSERT` | Mesures temperature/humidite | 120 | Non monte automatiquement dans Docker Compose |

Aucun fichier CSV, Excel ou JSON officiel de dataset ecole n'a ete trouve dans le depot. Le fichier de donnees fourni par l'ecole n'est pas present dans le depot sous un nom identifiable et doit etre ajoute manuellement si un autre fichier officiel existe.

Le depot contient cependant un jeu SQL exploitable dans `docs/data_tests`. L'importeur ajoute dans ce travail utilise uniquement ces fichiers existants, sans inventer de donnees.

## Colonnes detectees

| Fichier | Colonnes detectees |
| --- | --- |
| `exploitations.sql` | `id_exploitation`, `nom` |
| `entrepots.sql` | `id_entrepot`, `id_exploitation`, `nom` |
| `mesures.sql` | `id_entrepot`, `temperature`, `humidite`, `statut`, `timestamp` |

Il n'existe pas de fichier `lots.sql` dans le dossier `docs/data_tests`. L'importeur ne cree donc pas de lots depuis ce dataset.

## Commandes

Validation sans connexion MySQL :

```powershell
cd country/api
npm run dataset:import -- --dry-run
```

Import reel dans la base cible, lorsque Docker est lance :

```powershell
cd country/api
$env:DB_HOST="localhost"
$env:DB_PORT="3308"
$env:DB_USER="root"
$env:DB_PASS="root"
$env:DB_NAME="colombia_db"
npm run dataset:import
```

La commande par defaut vise `localhost:3308/colombia_db`, car les donnees existantes s'appellent `Colombia Farm` et `Colombia Farm2`. Le dataset ne contient pas de colonne pays ; l'affectation multi-pays se fait donc par la base cible choisie via les variables d'environnement.

## Mapping des donnees

| Colonne du dataset | Type d'origine | Table SQL cible | Colonne SQL cible | Transformation appliquee | Regle de validation |
| --- | --- | --- | --- | --- | --- |
| `id_exploitation` | entier SQL | `exploitations` | `id_exploitation` | Conversion en number | Obligatoire, non nul |
| `nom` | chaine SQL | `exploitations` | `nom` | Trim | Obligatoire, non vide |
| `id_entrepot` | entier SQL | `entrepots` | `id_entrepot` | Conversion en number | Obligatoire, non nul |
| `id_exploitation` | entier SQL | `entrepots` | `id_exploitation` | Conversion en number | Doit exister dans `exploitations.sql` |
| `nom` | chaine SQL | `entrepots` | `nom` | Trim | Obligatoire, non vide |
| `id_entrepot` | entier SQL | `mesures` | `id_entrepot` | Conversion en number | Doit exister dans `entrepots.sql` |
| `temperature` | nombre SQL | `mesures` | `temperature` | Conversion en number | Obligatoire, numerique |
| `humidite` | nombre SQL | `mesures` | `humidite` | Conversion en number | Obligatoire, numerique |
| `statut` | `NULL` dans le dataset | `mesures` | `statut` | Recalcule par `evaluateMesureStatus` | `conforme` ou `en alerte` |
| `timestamp` | chaine SQL | `mesures` | `timestamp` | Validation `YYYY-MM-DD HH:mm:ss` | Obligatoire, format SQL valide |

## Resultat de la derniere validation

Validation executee le 2 juillet 2026 avec :

```powershell
npm run dataset:import -- --dry-run
```

Resultat obtenu :

| Indicateur | Valeur reelle |
| --- | ---: |
| Lignes lues | 129 |
| Lignes importables | 114 |
| Lignes ignorees dans le fichier | 0 |
| Lignes rejetees | 15 |
| Exploitations importables | 2 |
| Entrepots importables | 7 |
| Mesures importables | 105 |

Les 15 lignes rejetees sont des mesures dont `id_entrepot = 5`. Or `docs/data_tests/entrepots.sql` ne cree pas l'entrepot 5. L'importeur les rejette donc proprement afin de respecter l'integrite referentielle.

Docker Desktop n'etait pas disponible lors de cette verification : la connexion au moteur Docker retournait une erreur sur le pipe `dockerDesktopLinuxEngine`. L'import MySQL reel et la capture terminal/SQL doivent donc etre realises manuellement une fois Docker lance.

## Idempotence

L'import est idempotent :

- les exploitations sont inserees ou mises a jour via `ON DUPLICATE KEY UPDATE` ;
- les entrepots sont inseres ou mis a jour via `ON DUPLICATE KEY UPDATE` ;
- les mesures sont dedupliquees par couple logique `id_entrepot + timestamp` avant insertion ;
- relancer l'import ne recree pas les memes mesures.

Les tests automatises verifient ce comportement avec `countMesuresToImport`.

## Verification SQL

Compter les donnees importees dans la base Colombie :

```powershell
docker exec mysql_Colombia mysql -uroot -proot colombia_db -e "SELECT COUNT(*) AS exploitations FROM exploitations;"
docker exec mysql_Colombia mysql -uroot -proot colombia_db -e "SELECT COUNT(*) AS entrepots FROM entrepots;"
docker exec mysql_Colombia mysql -uroot -proot colombia_db -e "SELECT COUNT(*) AS lots FROM lots;"
docker exec mysql_Colombia mysql -uroot -proot colombia_db -e "SELECT COUNT(*) AS mesures FROM mesures;"
```

Afficher quelques mesures importees :

```powershell
docker exec mysql_Colombia mysql -uroot -proot colombia_db -e "SELECT id_entrepot, temperature, humidite, statut, timestamp FROM mesures ORDER BY timestamp, id_entrepot LIMIT 10;"
```

Verifier les relations :

```powershell
docker exec mysql_Colombia mysql -uroot -proot colombia_db -e "SELECT e.id_entrepot, e.nom, x.nom AS exploitation FROM entrepots e LEFT JOIN exploitations x ON x.id_exploitation = e.id_exploitation ORDER BY e.id_entrepot;"
```

## Repartition multi-pays

Le dataset ne contient pas de colonne pays. La regle retenue est donc :

| Pays | Base cible | Port local Docker | Import automatique par defaut |
| --- | --- | ---: | --- |
| Bresil | `brazil_db` | 3307 | Non |
| Colombie | `colombia_db` | 3308 | Oui, par defaut de `dataset:import` |
| Equateur | `ecuador_db` | 3309 | Non |

Pour importer volontairement le meme dataset dans une autre base, changer `DB_PORT` et `DB_NAME` avant d'executer `npm run dataset:import`.
