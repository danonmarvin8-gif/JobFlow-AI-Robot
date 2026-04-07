-- Base de données : zoo
CREATE DATABASE IF NOT EXISTS zoo CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE zoo;

-- Table types_nourriture
CREATE TABLE types_nourriture (
    id_nourriture INT(11) NOT NULL AUTO_INCREMENT,
    type_nourriture VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_nourriture)
);

INSERT INTO types_nourriture (type_nourriture) VALUES
('Carnivore'),
('Herbivore'),
('Omnivore');

-- Table especes
CREATE TABLE especes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nom_espece VARCHAR(50) NOT NULL,
    duree_vie_moyenne INT(4),
    aquatique TINYINT(1) DEFAULT 0,
    id_nourriture INT(11),
    PRIMARY KEY (id),
    FOREIGN KEY (id_nourriture) REFERENCES types_nourriture(id_nourriture)
);

INSERT INTO especes (nom_espece, duree_vie_moyenne, aquatique, id_nourriture) VALUES
('Lion', 16, 0, 1),
('Girafe', 25, 0, 2),
('Chimpanze', 50, 0, 3),
('Pingouin', 20, 1, 1),
('Elephant', 70, 0, 2),
('Tortue geante', 100, 0, 2);

-- Table personnel
CREATE TABLE personnel (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    date_de_naissance DATE NOT NULL,
    sexe VARCHAR(50) NOT NULL,
    login VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    salaire DECIMAL(7,2) NOT NULL,
    fonction VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO personnel (nom, prenom, date_de_naissance, sexe, login, password, salaire, fonction) VALUES
('Martin', 'Paul', '1975-04-12', 'H', 'pmartin', 'admin123', 4500.00, 'Directeur'),
('Dubois', 'Claire', '1988-07-22', 'F', 'cdubois', 'employe123', 2200.00, 'Employe'),
('Petit', 'Marc', '1990-11-05', 'H', 'mpetit', 'employe456', 2100.00, 'Employe');

-- Table enclos
CREATE TABLE enclos (
    id VARCHAR(10) NOT NULL,
    nom_enclos VARCHAR(50),
    capacite_max INT(11) NOT NULL,
    taille FLOAT,
    eau TINYINT(1) DEFAULT 0,
    id_responsable INT(11),
    PRIMARY KEY (id),
    FOREIGN KEY (id_responsable) REFERENCES personnel(id)
);

INSERT INTO enclos (id, nom_enclos, capacite_max, taille, eau, id_responsable) VALUES
('A01', 'Savane africaine', 10, 500.00, 0, 2),
('A02', 'Zone tropicale', 8, 300.00, 0, 3),
('B01', 'Bassin aquatique', 15, 200.00, 1, 2),
('C01', 'Plaine des elephants', 5, 800.00, 0, 3);

-- Table animaux
CREATE TABLE animaux (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nom_animal VARCHAR(50) NOT NULL,
    date_de_naissance DATE,
    sexe VARCHAR(50),
    commentaire TEXT,
    id_espece INT(11) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (id_espece) REFERENCES especes(id)
);

INSERT INTO animaux (nom_animal, date_de_naissance, sexe, commentaire, id_espece) VALUES
('Simba', '2018-03-15', 'M', 'Lion male tres actif', 1),
('Nala', '2019-06-20', 'F', 'Lionne douce', 1),
('Kira', '2015-01-10', 'F', 'Girafe de grande taille', 2),
('Bouba', '2020-09-05', 'M', 'Chimpanze joueur', 3),
('Glacis', '2017-12-01', 'M', 'Pingouin nageur', 4),
('Elsa', '2010-05-18', 'F', 'Elephant tres calme', 5);

-- Table loc_animaux
CREATE TABLE loc_animaux (
    id INT(11) NOT NULL AUTO_INCREMENT,
    id_animaux INT(11) NOT NULL,
    id_enclos VARCHAR(10),
    date_arrivee DATE,
    date_sortie DATE,
    PRIMARY KEY (id),
    FOREIGN KEY (id_animaux) REFERENCES animaux(id),
    FOREIGN KEY (id_enclos) REFERENCES enclos(id)
);

INSERT INTO loc_animaux (id_animaux, id_enclos, date_arrivee, date_sortie) VALUES
(1, 'A01', '2018-03-15', NULL),
(2, 'A01', '2019-06-20', NULL),
(3, 'A01', '2015-01-10', NULL),
(4, 'A02', '2020-09-05', NULL),
(5, 'B01', '2017-12-01', NULL),
(6, 'C01', '2010-05-18', NULL);
