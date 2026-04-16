-- Création de la table pour les stocks de café
CREATE TABLE lots (
    id_lot VARCHAR(50) PRIMARY KEY,
    pays VARCHAR(50),
    exploitation VARCHAR(100),
    entrepot VARCHAR(100),
    date_stockage TIMESTAMP,
    statut VARCHAR(20) -- conforme, en alerte, périmé [cite: 138]
);

-- Création de la table pour les relevés des capteurs
CREATE TABLE mesures (
    id_mesure INT AUTO_INCREMENT PRIMARY KEY,
    id_entrepot VARCHAR(100),
    temperature FLOAT, -- en °C [cite: 144]
    humidite FLOAT,    -- en % [cite: 145]
    statut VARCHAR(20), -- conforme ou en alerte
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);