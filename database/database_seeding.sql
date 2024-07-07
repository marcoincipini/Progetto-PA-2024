-- Creazione della tabella "utenti"
CREATE TABLE utenti (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cognome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  ruolo VARCHAR(32)
);

-- Creazione della tabella "veicoli"
CREATE TABLE veicoli (
  targa VARCHAR(10) PRIMARY KEY,
  tipo_veicolo VARCHAR(32) NOT NULL,
  id_utente INT NOT NULL,
  FOREIGN KEY (id_utente) REFERENCES utenti(id)
);

-- Creazione della tabella "parcheggio"
CREATE TABLE parcheggi (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  posti_auto INT NOT NULL,
  posti_occupati INT NOT NULL,
  ora_inizio_giorno TIME NOT NULL,
  ora_fine_giorno TIME NOT NULL
);

-- Creazione della tabella "varci"
CREATE TABLE varchi (
  id SERIAL PRIMARY KEY,
  id_parcheggio INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  ingresso BOOLEAN NOT NULL DEFAULT TRUE,
  uscita BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (id_parcheggio) REFERENCES parcheggi(id)
);

-- Creazione della tabella "transito"
CREATE TABLE transiti (
  id SERIAL PRIMARY KEY,
  id_varco INT NOT NULL,
  targa VARCHAR(10) NOT NULL,
  data_passaggio DATE NOT NULL,
  ora_passaggio TIME NOT NULL,
  verso CHAR NOT NULL,
  tipo_veicolo VARCHAR(32) NOT NULL,
  FOREIGN KEY (id_varco) REFERENCES varchi(id),
  FOREIGN KEY (targa) REFERENCES veicoli(targa)
);

-- Creazione della tabella "tariffe"
CREATE TABLE tariffe (
  id SERIAL PRIMARY KEY,
  id_parcheggio INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  importo DECIMAL(10,2) NOT NULL,
  tipo_veicolo VARCHAR(32) NOT NULL,
  notte BOOLEAN NOT NULL DEFAULT TRUE,
  festivo BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (id_parcheggio) REFERENCES parcheggi(id)
);

-- Creazione della tabella "fattura"
CREATE TABLE fatture (
  id SERIAL PRIMARY KEY,
  id_parcheggio INT NOT NULL,
  targa VARCHAR(10) NOT NULL,
  importo DECIMAL(10,2) NOT NULL,
  data_ingresso DATE NOT NULL,
  ora_ingresso TIME NOT NULL,
  data_uscita DATE NOT NULL,
  ora_uscita TIME NOT NULL,
  FOREIGN KEY (id_parcheggio) REFERENCES parcheggi(id),
  FOREIGN KEY (targa) REFERENCES veicoli(targa)
);

-- Inserimento di dati di esempio nella tabella "parcheggio"
INSERT INTO parcheggi (nome, posti_auto, posti_occupati, ora_inizio_giorno, ora_fine_giorno)
VALUES ('Parcheggio Centrale', 100, 50, '08:00:00', '20:00:00'),
       ('Parcheggio Stazione', 200, 100, '08:00:00', '20:00:00'),
       ('Parcheggio Mare', 150, 75, '08:00:00', '20:00:00'),
       ('Parcheggio Duomo', 300, 150, '08:00:00', '20:00:00'),
       ('Parcheggio Museo', 250, 125, '08:00:00', '20:00:00'),
       ('Parcheggio Teatro', 350, 175, '08:00:00', '20:00:00'),
       ('Parcheggio Università', 400, 200, '08:00:00', '20:00:00'),
       ('Parcheggio Ospedale', 450, 225, '08:00:00', '20:00:00'),
       ('Parcheggio Stadio', 500, 250, '08:00:00', '20:00:00'),
       ('Parcheggio Mercato', 550, 275, '08:00:00', '20:00:00');

-- Inserimento di dati di esempio nella tabella "varchi"
INSERT INTO varchi (id_parcheggio, nome, ingresso, uscita)
VALUES (1, 'Via Roma', TRUE, TRUE),
       (2, 'Via Milano', TRUE, FALSE),
       (3, 'Via Napoli', FALSE, TRUE),
       (1, 'Via Torino', FALSE, TRUE),
       (2, 'Via Firenze', TRUE, FALSE),
       (3, 'Via Palermo', TRUE, FALSE),
       (1, 'Via Genova', TRUE, FALSE),
       (2, 'Via Bologna', TRUE, TRUE),
       (3, 'Via Venezia', TRUE, TRUE),
       (4, 'Via Verona', TRUE, TRUE);

-- Inserimento di dati di esempio nella tabella "transiti"
INSERT INTO transiti (id_varco, targa, data_passaggio, ora_passaggio, verso, tipo_veicolo)
VALUES 
  (1, 'AB123CD', '2024-07-01', '08:00:00', 'E', 'Auto'),
  (1, 'AB123CD', '2024-07-01', '18:00:00', 'U', 'Auto'),
  (2, 'EF456GH', '2024-07-02', '08:00:00', 'E', 'Auto'),
  (2, 'EF456GH', '2024-07-02', '18:00:00', 'U', 'Auto'),
  (3, 'IJ789KL', '2024-07-03', '08:00:00', 'E', 'Moto'),
  (3, 'IJ789KL', '2024-07-03', '18:00:00', 'U', 'Moto'),
  (1, 'MN012OP', '2024-07-04', '08:00:00', 'E', 'Auto'),
  (1, 'MN012OP', '2024-07-04', '18:00:00', 'U', 'Auto'),
  (2, 'QR345ST', '2024-07-05', '08:00:00', 'E', 'Moto'),
  (2, 'QR345ST', '2024-07-05', '18:00:00', 'U', 'Moto'),
  (3, 'YZ90123', '2024-07-10', '08:00:00', 'E', 'Auto'),
  (3, 'YZ90123', '2024-07-10', '18:00:00', 'U', 'Auto'),
  
  (1, '456ABCD', '2024-07-11', '08:00:00', 'E', 'Moto'),
  (2, '789EFGH', '2024-07-12', '08:00:00', 'E', 'Auto'),
  (3, '012IJKL', '2024-07-13', '08:00:00', 'E', 'Auto'),
  (1, '345LMNO', '2024-07-14', '08:00:00', 'E', 'Moto'),
  (2, '678PQRS', '2024-07-15', '08:00:00', 'E', 'Auto'),
  (3, '901TUVW', '2024-07-16', '08:00:00', 'E', 'Moto'),
  (1, '234XYZA', '2024-07-17', '08:00:00', 'E', 'Auto'),
  (2, '567BCDE', '2024-07-18', '08:00:00', 'E', 'Moto');
