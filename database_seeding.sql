
-- Creazione della tabella "users"
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(32),
  token REAL NOT NULL
);

-- Creazione della tabella "parkings"
CREATE TABLE IF NOT EXISTS parkings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parking_spots INT NOT NULL,
  occupied_spots INT NOT NULL,
  day_starting_hour TIME NOT NULL,
  day_finishing_hour TIME NOT NULL
);

-- Creazione della tabella "varchi"
CREATE TABLE IF NOT EXISTS passages (
  id SERIAL PRIMARY KEY,
  parking_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  entrance BOOLEAN NOT NULL DEFAULT TRUE,
  exit BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (parking_id) REFERENCES parkings(id)
);

-- Creazione della tabella "vehicles"
CREATE TABLE IF NOT EXISTS vehicles (
  plate VARCHAR(10) PRIMARY KEY,
  vehicle_type VARCHAR(32) NOT NULL,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Creazione della tabella "transito"
CREATE TABLE IF NOT EXISTS transits (
  id SERIAL PRIMARY KEY,
  passage_id INT NOT NULL,
  plate VARCHAR(10) NOT NULL,
  passing_by_date DATE NOT NULL,
  passing_by_hour TIME NOT NULL,
  direction CHAR NOT NULL,
  vehicle_type VARCHAR(32) NOT NULL,
  FOREIGN KEY (passage_id) REFERENCES passages(id),
  FOREIGN KEY (plate) REFERENCES vehicles(plate)
);

-- Creazione della tabella "fees"
CREATE TABLE IF NOT EXISTS fees (
  id SERIAL PRIMARY KEY,
  parking_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  hourly_amount DECIMAL(10,2) NOT NULL,
  vehicle_type VARCHAR(32) NOT NULL,
  night BOOLEAN NOT NULL DEFAULT TRUE,
  festive BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (parking_id) REFERENCES parkings(id)
);

-- Creazione della tabella "fattura"
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  parking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  entrance_transit INT NOT NULL, 
  exit_transit INT NOT NULL,
  FOREIGN KEY (entrance_transit) REFERENCES transits(id),
  FOREIGN KEY (exit_transit
) REFERENCES transits(id),
  FOREIGN KEY (parking_id) REFERENCES parkings(id)
);

-- Inserimento di dati di esempio nella tabella "users"
INSERT INTO users (name, surname, email, password, role, token)
VALUES 
  ('Marco', 'Rossi', 'marco.rossi@example.com', 'password123', 'operatore', 10.0),
  ('Laura', 'Bianchi', 'laura.bianchi@example.com', 'password123', 'automobilista', 5.0),
  ('Giovanni', 'Verdi', 'giovanni.verdi@example.com', 'password123', 'automobilista', 5.0),
  ('Anna', 'Neri', 'anna.neri@example.com', 'password123', 'automobilista', 5.0),
  ('Paolo', 'Russo', 'paolo.russo@example.com', 'password123', 'operatore', 10.0);

-- Inserimento di dati di esempio nella tabella "vehicles"
INSERT INTO vehicles (plate, vehicle_type, user_id)
VALUES 
  ('AB123CD', 'Auto', 1),
  ('EF456GH', 'Auto', 2),
  ('IJ789KL', 'Moto', 3),
  ('MN012OP', 'Auto', 4),
  ('QR345ST', 'Moto', 5),
  ('YZ90123', 'Auto', 1),
  ('456ABCD', 'Moto', 2),
  ('789EFGH', 'Auto', 3),
  ('012IJKL', 'Auto', 4),
  ('345LMNO', 'Moto', 5),
  ('678PQRS', 'Auto', 1),
  ('901TUVW', 'Moto', 2),
  ('234XYZA', 'Auto', 3),
  ('567BCDE', 'Moto', 4),
  ('C123DEF', 'Camion', 2),
  ('G456HIJ', 'Camion', 4),
  ('STU901V', 'Camion', 5),
  ('K789LMN', 'Moto', 1),
  ('P012OPQ', 'Auto', 3);

-- Inserimento di dati di esempio nella tabella "parkings"
INSERT INTO parkings (name, parking_spots, occupied_spots, day_starting_hour, day_finishing_hour)
VALUES ('parcheggio Centrale', 100, 50, '06:00:00', '22:00:00'),
       ('parcheggio Stazione', 200, 100, '07:00:00', '21:00:00'),
       ('parcheggio Mare', 150, 75, '08:00:00', '20:00:00'),
       ('parcheggio Duomo', 300, 150, '09:00:00', '23:00:00'),
       ('parcheggio Museo', 250, 125, '06:30:00', '19:30:00');

-- Inserimento di dati di esempio nella tabella "passages"
INSERT INTO passages (parking_id, name, entrance, exit)
VALUES (1, 'Via Roma', TRUE, TRUE),
       (2, 'Via Milano', TRUE, FALSE),
       (3, 'Via Napoli', FALSE, TRUE),
       (1, 'Via Torino', FALSE, TRUE),
       (5, 'Via Catania', TRUE, FALSE),
       (2, 'Via Firenze', TRUE, FALSE),
       (3, 'Via Palermo', TRUE, FALSE),
       (1, 'Via Genova', TRUE, FALSE),
       (2, 'Via Bologna', TRUE, TRUE),
       (5, 'Via Messina', TRUE, TRUE),
       (3, 'Via Venezia', TRUE, TRUE),
       (4, 'Via Verona', TRUE, TRUE),
       (5, 'Via Agrigento', FALSE, TRUE);

-- Inserimento di dati di esempio nella tabella "transits"
INSERT INTO transits (passage_id, plate, passing_by_date, passing_by_hour, direction, vehicle_type)
VALUES 
  (1, 'AB123CD', '2024-06-15', '07:15:32', 'E', 'Auto'),
  (1, 'AB123CD', '2024-06-15', '19:30:45', 'U', 'Auto'),
  (2, 'EF456GH', '2024-05-20', '09:45:15', 'E', 'Auto'),
  (2, 'EF456GH', '2024-05-21', '17:15:59', 'U', 'Auto'),
  (3, 'IJ789KL', '2024-09-05', '06:05:08', 'E', 'Moto'),
  (3, 'IJ789KL', '2024-09-08', '20:20:23', 'U', 'Moto'),
  (1, 'MN012OP', '2024-10-04', '05:35:44', 'E', 'Auto'),
  (1, 'MN012OP', '2024-10-04', '21:25:36', 'U', 'Auto'),
  (2, 'QR345ST', '2024-03-12', '10:50:54', 'E', 'Moto'),
  (2, 'QR345ST', '2024-04-20', '22:40:21', 'U', 'Moto'),
  (3, 'YZ90123', '2024-01-10', '11:25:16', 'E', 'Auto'),
  (3, 'YZ90123', '2024-01-25', '23:50:38', 'U', 'Auto'),
  (1, '456ABCD', '2024-12-11', '12:10:29', 'E', 'Moto'),
  (2, '789EFGH', '2024-02-21', '13:20:45', 'E', 'Auto'),
  (3, '012IJKL', '2024-05-13', '14:30:17', 'E', 'Auto'),
  (1, '345LMNO', '2024-07-14', '15:40:53', 'E', 'Moto'),
  (2, '678PQRS', '2024-08-15', '16:50:24', 'E', 'Auto'),
  (3, '901TUVW', '2024-04-16', '18:55:39', 'E', 'Moto'),
  (1, '234XYZA', '2024-03-17', '19:00:03', 'E', 'Auto'),
  (2, '567BCDE', '2024-07-18', '20:05:47', 'E', 'Moto'),
  (1, 'C123DEF', '2024-09-19', '05:50:12', 'E', 'Camion'),
  (1, 'C123DEF', '2024-10-20', '09:30:25', 'U', 'Camion'),
  (2, 'G456HIJ', '2024-06-20', '06:55:25', 'E', 'Camion'),
  (2, 'G456HIJ', '2024-06-20', '17:50:56', 'U', 'Camion'),
  (3, 'K789LMN', '2024-02-21', '07:45:41', 'E', 'Moto'),
  (3, 'K789LMN', '2024-02-21', '19:55:28', 'U', 'Moto'),
  (1, 'P012OPQ', '2024-04-01', '08:40:35', 'E', 'Auto'),
  (1, 'P012OPQ', '2024-03-22', '20:40:19', 'U', 'Auto'),
  (2, 'STU901V', '2024-07-19', '12:00:44', 'E', 'Camion'),
  (2, 'STU901V', '2024-08-21', '20:30:57', 'U', 'Camion'),
  (5, 'C123DEF', '2024-08-21', '10:40:12', 'E', 'Camion'),
  (5, 'C123DEF', '2024-12-11', '19:45:33', 'U', 'Camion'),
  (5, 'STU901V', '2024-08-21', '21:55:25', 'E', 'Camion'),
  (5, 'STU901V', '2024-08-22', '23:30:40', 'U', 'Camion');


INSERT INTO fees (parking_id, name, hourly_amount, vehicle_type, night, festive)
VALUES 
  -- parkings 1
  (1, 'Tariffa Giornaliera Auto', 1.00, 'Auto', FALSE, FALSE),
  (1, 'Tariffa Notturna Auto', 4.00, 'Auto', TRUE, FALSE),
  (1, 'Tariffa Festiva Auto', 1.50, 'Auto', FALSE, TRUE),
  (1, 'Tariffa Giornaliera Camion', 2.00, 'Camion', FALSE, FALSE),
  (1, 'Tariffa Notturna Camion', 6.50, 'Camion', TRUE, FALSE),
  (1, 'Tariffa Festiva Camion', 3.00, 'Camion', FALSE, TRUE),
  (1, 'Tariffa Giornaliera Moto', 1.00, 'Moto', FALSE, FALSE),
  (1, 'Tariffa Notturna Moto', 3.00, 'Moto', TRUE, FALSE),
  (1, 'Tariffa Festiva Moto', 1.20, 'Moto', FALSE, TRUE),
  -- parkings 2
  (2, 'Tariffa Giornaliera Auto', 1.20, 'Auto', FALSE, FALSE),
  (2, 'Tariffa Notturna Auto', 3.50, 'Auto', TRUE, FALSE),
  (2, 'Tariffa Festiva Auto', 2.20, 'Auto', FALSE, TRUE),
  (2, 'Tariffa Giornaliera Camion', 3.00, 'Camion', FALSE, FALSE),
  (2, 'Tariffa Notturna Camion', 5.50, 'Camion', TRUE, FALSE),
  (2, 'Tariffa Festiva Camion', 4.00, 'Camion', FALSE, TRUE),
  (2, 'Tariffa Giornaliera Moto', 1.10, 'Moto', FALSE, FALSE),
  (2, 'Tariffa Notturna Moto', 2.50, 'Moto', TRUE, FALSE),
  (2, 'Tariffa Festiva Moto', 2.00, 'Moto', FALSE, TRUE),
  -- parkings 3
  (3, 'Tariffa Giornaliera Auto', 0.80, 'Auto', FALSE, FALSE),
  (3, 'Tariffa Notturna Auto', 2.50, 'Auto', TRUE, FALSE),
  (3, 'Tariffa Festiva Auto', 1.00, 'Auto', FALSE, TRUE),
  (3, 'Tariffa Giornaliera Camion', 2.50, 'Camion', FALSE, FALSE),
  (3, 'Tariffa Notturna Camion', 4.25, 'Camion', TRUE, FALSE),
  (3, 'Tariffa Festiva Camion', 3.50, 'Camion', FALSE, TRUE),
  (3, 'Tariffa Giornaliera Moto', 0.70, 'Moto', FALSE, FALSE),
  (3, 'Tariffa Notturna Moto', 1.80, 'Moto', TRUE, FALSE),
  (3, 'Tariffa Festiva Moto', 1.10, 'Moto', FALSE, TRUE),
  -- parkings 4
  (4, 'Tariffa Giornaliera Auto', 2.00, 'Auto', FALSE, FALSE),
  (4, 'Tariffa Notturna Auto', 5.00, 'Auto', TRUE, FALSE),
  (4, 'Tariffa Festiva Auto', 3.00, 'Auto', FALSE, TRUE),
  (4, 'Tariffa Giornaliera Camion', 7.00, 'Camion', FALSE, FALSE),
  (4, 'Tariffa Notturna Camion', 7.50, 'Camion', TRUE, FALSE),
  (4, 'Tariffa Festiva Camion', 7.20, 'Camion', FALSE, TRUE),
  (4, 'Tariffa Giornaliera Moto', 1.75, 'Moto', FALSE, FALSE),
  (4, 'Tariffa Notturna Moto', 3.38, 'Moto', TRUE, FALSE),
  (4, 'Tariffa Festiva Moto', 2.50, 'Moto', FALSE, TRUE),
  -- parkings 5
  (5, 'Tariffa Giornaliera Auto', 0.50, 'Auto', FALSE, FALSE),
  (5, 'Tariffa Notturna Auto', 3.50, 'Auto', TRUE, FALSE),
  (5, 'Tariffa Festiva Auto', 1.20, 'Auto', FALSE, TRUE),
  (5, 'Tariffa Giornaliera Camion', 4.00, 'Camion', FALSE, FALSE),
  (5, 'Tariffa Notturna Camion', 4.50, 'Camion', TRUE, FALSE),
  (5, 'Tariffa Festiva Camion', 4.25, 'Camion', FALSE, TRUE),
  (5, 'Tariffa Giornaliera Moto', 0.60, 'Moto', FALSE, FALSE),
  (5, 'Tariffa Notturna Moto', 1.25, 'Moto', TRUE, FALSE),
  (5, 'Tariffa Festiva Moto', 0.80, 'Moto', FALSE, TRUE);

-- Inserimento di dati di esempio nella tabella "bills"
INSERT INTO bills (parking_id, amount, entrance_transit, exit_transit)
VALUES 
  (1, 10.50, 1, 2),
  (2, 20.00, 3, 4),
  (3, 15.75, 5, 6),
  (1, 12.00, 7, 8),
  (2, 18.25, 9, 10),
  (3, 22.50, 11, 12),
  (1, 14.00, 13, 14),
  (2, 16.50, 15, 16),
  (3, 19.75, 17, 18),
  (1, 17.00, 19, 20),
  (2, 21.25, 21, 22),
  (3, 23.50, 23, 24),
  (1, 25.00, 25, 26),
  (2, 27.50, 27, 28);