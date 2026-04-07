-- ============================================================
-- Système de Gestion Militaire - Script de création
-- Base de données: GestionMilitaire
-- Description: Modèle de données pour la gestion des grades,
-- soldats, unités, affectations, batailles et blessures
-- ============================================================

-- ============================================================
-- Création de la base de données
-- ============================================================
CREATE DATABASE IF NOT EXISTS GestionMilitaire;
USE GestionMilitaire;

-- ============================================================
-- Table: GRADES
-- Description: Grades militaires disponibles
-- ============================================================
CREATE TABLE GRADES (
    code_grade VARCHAR(50) PRIMARY KEY,
    intitule_grade VARCHAR(50) NOT NULL
);

-- ============================================================
-- Table: SOLDATS
-- Description: Information des soldats enrôlés
-- ============================================================
CREATE TABLE SOLDATS (
    code_soldat VARCHAR(50) PRIMARY KEY,
    nom_soldat VARCHAR(50) NOT NULL,
    prenom_soldat VARCHAR(50) NOT NULL,
    date_naissance DATE,
    date_deces DATE
);

-- ============================================================
-- Table: UNITES
-- Description: Unités militaires (Infanterie, Cavalerie, etc.)
-- ============================================================
CREATE TABLE UNITES (
    code_unite VARCHAR(50) PRIMARY KEY,
    nom_unite VARCHAR(50) NOT NULL
);

-- ============================================================
-- Table: AFFECTATIONS
-- Description: Affectation des soldats aux unités
-- Relation: Un soldat peut être affecté à plusieurs unités
-- ============================================================
CREATE TABLE AFFECTATIONS (
    code_soldat VARCHAR(50) NOT NULL,
    code_unite VARCHAR(50) NOT NULL,
    date_affectation DATE PRIMARY KEY,
    FOREIGN KEY (code_soldat) REFERENCES SOLDATS(code_soldat),
    FOREIGN KEY (code_unite) REFERENCES UNITES(code_unite)
);

-- ============================================================
-- Table: BATAILLES
-- Description: Enregistrement des batailles
-- ============================================================
CREATE TABLE BATAILLES (
    date_bataille DATE PRIMARY KEY
);

-- ============================================================
-- Table: BLESSURES
-- Description: Types de blessures possibles
-- ============================================================
CREATE TABLE BLESSURES (
    code_blessure INTEGER PRIMARY KEY,
    type_blessure VARCHAR(5) NOT NULL
);

-- ============================================================
-- Table: BLESSES
-- Description: Enregistrement des soldats blessés lors des batailles
-- Relation: Un soldat peut avoir plusieurs blessures
-- ============================================================
CREATE TABLE BLESSES (
    code_soldat VARCHAR(50) NOT NULL,
    date_blessure DATE PRIMARY KEY,
    code_blessure INTEGER NOT NULL,
    FOREIGN KEY (code_soldat) REFERENCES SOLDATS(code_soldat),
    FOREIGN KEY (code_blessure) REFERENCES BLESSURES(code_blessure)
);

-- ============================================================
-- Table: PROMOTIONS
-- Description: Historique des promotions des soldats
-- Relation: Chaque promotion assigne un grade à un soldat
-- ============================================================
CREATE TABLE PROMOTIONS (
    code_soldat VARCHAR(50) NOT NULL,
    code_grade VARCHAR(50) NOT NULL,
    date_promotion DATE PRIMARY KEY,
    FOREIGN KEY (code_soldat) REFERENCES SOLDATS(code_soldat),
    FOREIGN KEY (code_grade) REFERENCES GRADES(code_grade)
);

-- ============================================================
-- Création des indices de performance
-- ============================================================
CREATE INDEX idx_soldat_nom ON SOLDATS(nom_soldat);
CREATE INDEX idx_unite_nom ON UNITES(nom_unite);
CREATE INDEX idx_affectation_soldat ON AFFECTATIONS(code_soldat);
CREATE INDEX idx_affectation_unite ON AFFECTATIONS(code_unite);
CREATE INDEX idx_blesses_soldat ON BLESSES(code_soldat);
CREATE INDEX idx_promotions_soldat ON PROMOTIONS(code_soldat);
CREATE INDEX idx_promotions_grade ON PROMOTIONS(code_grade);

-- ============================================================
-- Données d'exemple - GRADES
-- ============================================================
INSERT INTO GRADES (code_grade, intitule_grade) VALUES
('G001', 'Général'),
('G002', 'Colonel'),
('G003', 'Capitaine'),
('G004', 'Sergent'),
('G005', 'Caporal'),
('G006', 'Soldat');

-- ============================================================
-- Données d'exemple - UNITES
-- ============================================================
INSERT INTO UNITES (code_unite, nom_unite) VALUES
('U001', 'Infanterie'),
('U002', 'Cavalerie'),
('U003', 'Artillerie'),
('U004', 'Génie Militaire'),
('U005', 'Marine'),
('U006', 'Aviation');

-- ============================================================
-- Données d'exemple - SOLDATS
-- ============================================================
INSERT INTO SOLDATS (code_soldat, nom_soldat, prenom_soldat, date_naissance, date_deces) VALUES
('S001', 'Dupont', 'Jean', '1985-05-15', NULL),
('S002', 'Martin', 'Pierre', '1988-03-22', '2020-11-30'),
('S003', 'Bernard', 'Marie', '1990-07-10', NULL),
('S004', 'Roux', 'Paul', '1987-01-28', NULL),
('S005', 'Petit', 'Luc', '1989-09-14', NULL);

-- ============================================================
-- Données d'exemple - AFFECTATIONS
-- ============================================================
INSERT INTO AFFECTATIONS (code_soldat, code_unite, date_affectation) VALUES
('S001', 'U001', '2010-01-15'),
('S002', 'U002', '2008-06-20'),
('S003', 'U003', '2012-09-10'),
('S004', 'U001', '2015-02-01'),
('S005', 'U004', '2014-05-15');

-- ============================================================
-- Données d'exemple - BATAILLES
-- ============================================================
INSERT INTO BATAILLES (date_bataille) VALUES
('2000-08-15'),
('2001-06-20'),
('2002-03-10'),
('2003-11-25');

-- ============================================================
-- Données d'exemple - BLESSURES
-- ============================================================
INSERT INTO BLESSURES (code_blessure, type_blessure) VALUES
(1, 'LEGER'),
(2, 'MOYEN'),
(3, 'GRAVE');

-- ============================================================
-- Données d'exemple - BLESSES
-- ============================================================
INSERT INTO BLESSES (code_soldat, date_blessure, code_blessure) VALUES
('S001', '2000-08-16', 1),
('S002', '2001-06-21', 3),
('S003', '2002-03-11', 2);

-- ============================================================
-- Données d'exemple - PROMOTIONS
-- ============================================================
INSERT INTO PROMOTIONS (code_soldat, code_grade, date_promotion) VALUES
('S001', 'G006', '2010-01-15'),
('S001', 'G005', '2012-06-10'),
('S002', 'G006', '2008-06-20'),
('S002', 'G004', '2011-03-15'),
('S003', 'G006', '2012-09-10'),
('S004', 'G006', '2015-02-01'),
('S004', 'G005', '2017-08-20'),
('S005', 'G006', '2014-05-15');

-- ============================================================
-- Requêtes utiles pour la gestion
-- ============================================================

-- Voir tous les soldats avec leurs derniers grades
-- SELECT s.nom_soldat, s.prenom_soldat, g.intitule_grade 
-- FROM SOLDATS s
-- LEFT JOIN PROMOTIONS p ON s.code_soldat = p.code_soldat
-- LEFT JOIN GRADES g ON p.code_grade = g.code_grade
-- ORDER BY s.nom_soldat;

-- Voir les affectations actuelles
-- SELECT s.nom_soldat, u.nom_unite, a.date_affectation
-- FROM AFFECTATIONS a
-- JOIN SOLDATS s ON a.code_soldat = s.code_soldat
-- JOIN UNITES u ON a.code_unite = u.code_unite
-- ORDER BY a.date_affectation DESC;

-- Voir les blessés et leurs blessures
-- SELECT s.nom_soldat, b.type_blessure, bl.date_blessure
-- FROM BLESSES bl
-- JOIN SOLDATS s ON bl.code_soldat = s.code_soldat
-- JOIN BLESSURES b ON bl.code_blessure = b.code_blessure
-- ORDER BY bl.date_blessure DESC;
