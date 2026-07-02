# Modele de donnees SQL FutureKawa

## Sources analysees

Le modele ci-dessous est base sur les fichiers reels du projet :

- `country/init.sql` pour la creation des tables et des contraintes SQL ;
- `country/api/src/exploitations/exploitation.entity.ts` ;
- `country/api/src/entrepots/entrepot.entity.ts` ;
- `country/api/src/lots/lot.entity.ts` ;
- `country/api/src/mesures/mesure.entity.ts`.

Les relations sont materialisees dans `country/init.sql` par des cles etrangeres. Les entites TypeORM exposent les colonnes, mais ne declarent pas de relations `@ManyToOne` ou `@OneToMany`.

## Diagramme

- Mermaid : `docs/database/mcd_futurekawa.mmd`
- PNG : `docs/database/mcd_futurekawa.png`

## Tables, cles et contraintes

| Table | Cle primaire | Cles etrangeres | Colonnes importantes | Contraintes | Role metier |
| --- | --- | --- | --- | --- | --- |
| `exploitations` | `id_exploitation BIGINT AUTO_INCREMENT` | Aucune | `nom VARCHAR(100)` | `nom NOT NULL` | Representer une exploitation cafeiere ou zone metier |
| `entrepots` | `id_entrepot BIGINT AUTO_INCREMENT` | `id_exploitation BIGINT` vers `exploitations(id_exploitation)` | `nom VARCHAR(100)` | FK `fk_entrepot_exploitation`, `ON DELETE SET NULL`; `id_exploitation` nullable; `nom` nullable | Rattacher les entrepots aux exploitations |
| `lots` | `id_lot BIGINT AUTO_INCREMENT` | `id_entrepot BIGINT` vers `entrepots(id_entrepot)` | `date_stockage TIMESTAMP`, `statut VARCHAR(20)` | FK `fk_lot_entrepot`, `ON DELETE SET NULL`; `date_stockage DEFAULT CURRENT_TIMESTAMP`; `id_entrepot` nullable; `statut` nullable | Suivre les lots de cafe stockes |
| `mesures` | `id_mesure INT AUTO_INCREMENT` | `id_entrepot BIGINT` vers `entrepots(id_entrepot)` | `temperature FLOAT`, `humidite FLOAT`, `statut VARCHAR(20)`, `timestamp TIMESTAMP` | FK `fk_mesure_entrepot`, `ON DELETE SET NULL`; `timestamp DEFAULT CURRENT_TIMESTAMP`; mesures nullable | Historiser les releves temperature/humidite par entrepot |

## Cardinalites

| Relation | Cardinalite | Preuve dans le schema |
| --- | --- | --- |
| Une exploitation possede plusieurs entrepots | `exploitations 1 -> 0..n entrepots` | FK `entrepots.id_exploitation` |
| Un entrepot appartient a une exploitation | `entrepots 0..n -> 0..1 exploitation` | `id_exploitation` est nullable et `ON DELETE SET NULL` |
| Un entrepot possede plusieurs lots | `entrepots 1 -> 0..n lots` | FK `lots.id_entrepot` |
| Un lot appartient a un entrepot | `lots 0..n -> 0..1 entrepot` | `id_entrepot` est nullable et `ON DELETE SET NULL` |
| Un entrepot possede plusieurs mesures | `entrepots 1 -> 0..n mesures` | FK `mesures.id_entrepot` |
| Une mesure appartient a un entrepot | `mesures 0..n -> 0..1 entrepot` | `id_entrepot` est nullable et `ON DELETE SET NULL` |

## Integrite referentielle

Le schema MySQL protege les relations principales avec trois contraintes :

```sql
CONSTRAINT fk_entrepot_exploitation
  FOREIGN KEY (id_exploitation)
  REFERENCES exploitations(id_exploitation)
  ON DELETE SET NULL

CONSTRAINT fk_lot_entrepot
  FOREIGN KEY (id_entrepot)
  REFERENCES entrepots(id_entrepot)
  ON DELETE SET NULL

CONSTRAINT fk_mesure_entrepot
  FOREIGN KEY (id_entrepot)
  REFERENCES entrepots(id_entrepot)
  ON DELETE SET NULL
```

Le choix `ON DELETE SET NULL` preserve les donnees historiques lorsqu'une exploitation ou un entrepot est supprime. Une mesure ou un lot peut donc rester dans l'historique, meme si son rattachement metier a ete supprime.

## Index et unicite

Le schema declare explicitement les cles primaires. Il ne declare pas de contrainte d'unicite sur les noms d'exploitations, les noms d'entrepots ou les couples `id_entrepot + timestamp`.

L'importeur du jeu de donnees gere donc l'idempotence applicativement :

- upsert par cle primaire pour `exploitations` ;
- upsert par cle primaire pour `entrepots` ;
- verification du couple `id_entrepot + timestamp` avant insertion des mesures.

## Timestamps

Deux tables contiennent un timestamp :

| Table | Colonne | Comportement |
| --- | --- | --- |
| `lots` | `date_stockage` | `DEFAULT CURRENT_TIMESTAMP` |
| `mesures` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` |

Le projet ne contient pas de colonnes generiques `created_at` ou `updated_at`.
