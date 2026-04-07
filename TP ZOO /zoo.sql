Marvin
marvin_dbt_55597
Invisible

Daniel — 18/03/2026 01:14
bvv
Naroxy. [CB12],  — 18/03/2026 01:14
Type de fichier joint : acrobat
Corpus 5 - Les animaux et nous - préservation faune.pdf
1.25 MB
version pdf
Naroxy. [CB12],  — 18/03/2026 03:07
Type de fichier joint : acrobat
boole 15 octobre 2013_240506_105217_250203_092509.pdf
769.00 KB
Daniel — Hier à 02:08
Image
Carlita — Hier à 03:02
http://meet.google.com/djr-ohxg-gph
Meet
Real-time meetings by Google. Using your browser, share your video, desktop, and presentations with teammates and customers.
Image
Naroxy. [CB12],  — Hier à 03:09
Image
Groupe 1 : Nicola, Daniel, Oumar
Groupe 2 : Imad, Alpha
Groupe 3 : Roumaissa, Lana, Nihad, Jessy
Groupe 4 : 
Groupe 5 : Carla, Kenndy, Nemo, Samira
Groupe 6 : Noah
Groupe 7 : Marvin, Amine, Moha 
Jessy — Hier à 03:15
Type de fichier joint : acrobat
Sujet 2023.pdf
1.06 MB
Samira — Hier à 03:22
. 
Naroxy. [CB12],  — 01:19
-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 24, 2026 at 08:18 AM

zoo.sql
7 Ko
﻿
-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 24, 2026 at 08:18 AM
-- Server version: 8.0.44
-- PHP Version: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zoo`
--

-- --------------------------------------------------------

--
-- Table structure for table `animaux`
--

CREATE TABLE `animaux` (
  `id` int NOT NULL,
  `espece_id` int NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `sexe` enum('M','F') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pseudo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `animaux`
--

INSERT INTO `animaux` (`id`, `espece_id`, `date_naissance`, `sexe`, `pseudo`, `commentaire`) VALUES
(1, 1, '2015-06-01', 'M', 'Simba', 'Le roi'),
(2, 1, '2016-08-15', 'F', 'Nala', 'Très calme'),
(3, 2, '2010-02-10', 'M', 'Dumbo', 'Aime les cacahuètes'),
(4, 3, '2018-11-20', 'F', 'Flipper', 'Très joueur');

-- --------------------------------------------------------

--
-- Table structure for table `enclos`
--

CREATE TABLE `enclos` (
  `id` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacite_max` int NOT NULL,
  `taille` int DEFAULT NULL,
  `eau` tinyint(1) NOT NULL,
  `responsable_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enclos`
--

INSERT INTO `enclos` (`id`, `nom`, `capacite_max`, `taille`, `eau`, `responsable_id`) VALUES
('A01', 'Savane Africaine', 10, 5000, 1, 1),
('A02', 'Bassin Océanique', 5, 2000, 1, 2),
('A03', 'Fôret Tempérée', 8, 3000, 0, 2);

-- --------------------------------------------------------

--
-- Table structure for table `especes`
--

CREATE TABLE `especes` (
  `id` int NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_nourriture` enum('Carnivore','Herbivore','Omnivore') COLLATE utf8mb4_unicode_ci NOT NULL,
  `duree_vie` int NOT NULL,
  `aquatique` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `especes`
--

INSERT INTO `especes` (`id`, `nom`, `type_nourriture`, `duree_vie`, `aquatique`) VALUES
(1, 'Lion', 'Carnivore', 15, 0),
(2, 'Éléphant', 'Herbivore', 60, 0),
(3, 'Dauphin', 'Carnivore', 40, 1),
(4, 'Ours brun', 'Omnivore', 25, 0);

-- --------------------------------------------------------

--
-- Table structure for table `loc_animaux`
--

CREATE TABLE `loc_animaux` (
  `id` int NOT NULL,
  `animal_id` int NOT NULL,
  `enclos_id` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_arrivee` datetime DEFAULT NULL,
  `date_sortie` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loc_animaux`
--

INSERT INTO `loc_animaux` (`id`, `animal_id`, `enclos_id`, `date_arrivee`, `date_sortie`) VALUES
(1, 1, 'A01', '2020-01-01 10:00:00', NULL),
(2, 2, 'A01', '2020-01-01 10:00:00', NULL),
(3, 3, 'A01', '2010-05-15 14:00:00', NULL),
(4, 4, 'A02', '2019-03-20 09:30:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personnels`
--

CREATE TABLE `personnels` (
  `id` int NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date NOT NULL,
  `sexe` enum('H','F') COLLATE utf8mb4_unicode_ci NOT NULL,
  `login` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mdp` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fonction` enum('Directeur','Employe') COLLATE utf8mb4_unicode_ci NOT NULL,
  `salaire` decimal(7,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personnels`
--

INSERT INTO `personnels` (`id`, `nom`, `prenom`, `date_naissance`, `sexe`, `login`, `mdp`, `fonction`, `salaire`) VALUES
(1, 'Dupont', 'Jean', '1980-05-15', 'H', 'admin', 'admin', 'Directeur', 4500.00),
(2, 'Durand', 'Paul', '1990-10-20', 'H', 'john', 'john', 'Employe', 2500.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `animaux`
--
ALTER TABLE `animaux`
  ADD PRIMARY KEY (`id`),
  ADD KEY `espece_id` (`espece_id`);

--
-- Indexes for table `enclos`
--
ALTER TABLE `enclos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `responsable_id` (`responsable_id`);

--
-- Indexes for table `especes`
--
ALTER TABLE `especes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loc_animaux`
--
ALTER TABLE `loc_animaux`
  ADD PRIMARY KEY (`id`),
  ADD KEY `animal_id` (`animal_id`),
  ADD KEY `enclos_id` (`enclos_id`);

--
-- Indexes for table `personnels`
--
ALTER TABLE `personnels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `animaux`
--
ALTER TABLE `animaux`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `especes`
--
ALTER TABLE `especes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `loc_animaux`
--
ALTER TABLE `loc_animaux`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personnels`
--
ALTER TABLE `personnels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `animaux`
--
ALTER TABLE `animaux`
  ADD CONSTRAINT `animaux_ibfk_1` FOREIGN KEY (`espece_id`) REFERENCES `especes` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `enclos`
--
ALTER TABLE `enclos`
  ADD CONSTRAINT `enclos_ibfk_1` FOREIGN KEY (`responsable_id`) REFERENCES `personnels` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loc_animaux`
--
ALTER TABLE `loc_animaux`
  ADD CONSTRAINT `loc_animaux_ibfk_1` FOREIGN KEY (`animal_id`) REFERENCES `animaux` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loc_animaux_ibfk_2` FOREIGN KEY (`enclos_id`) REFERENCES `enclos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
zoo.sql
7 Ko