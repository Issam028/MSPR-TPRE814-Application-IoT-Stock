-- Création de la table pour les informations d'une exploitation
CREATE TABLE exploitations (
    id_exploitation BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

-- Création de la table pour les entrepôts
CREATE TABLE entrepots (
    id_entrepot BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_exploitation BIGINT,
    nom VARCHAR(100),
    CONSTRAINT fk_entrepot_exploitation FOREIGN KEY (id_exploitation) REFERENCES exploitations(id_exploitation) ON DELETE SET NULL
);

-- Création de la table pour les stocks de café
CREATE TABLE lots (
    id_lot BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_entrepot BIGINT,
    date_stockage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20), -- conforme, en alerte, périmé [cite: 138]
    CONSTRAINT fk_lot_entrepot FOREIGN KEY (id_entrepot) REFERENCES entrepots(id_entrepot) ON DELETE SET NULL
);

-- Création de la table pour les relevés des capteurs
CREATE TABLE mesures (
    id_mesure INT AUTO_INCREMENT PRIMARY KEY,
    id_entrepot BIGINT,
    temperature FLOAT, -- en °C [cite: 144]
    humidite FLOAT,    -- en % [cite: 145]
    statut VARCHAR(20), -- conforme ou en alerte
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mesure_entrepot FOREIGN KEY (id_entrepot) REFERENCES entrepots(id_entrepot) ON DELETE SET NULL
);