-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: bank_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `bank_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `bank_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `bank_db`;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,1,20.00);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fines`
--

DROP TABLE IF EXISTS `fines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `days_late` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fines`
--

LOCK TABLES `fines` WRITE;
/*!40000 ALTER TABLE `fines` DISABLE KEYS */;
/*!40000 ALTER TABLE `fines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `library_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `library_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `library_db`;

--
-- Table structure for table `autorid`
--

DROP TABLE IF EXISTS `autorid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autorid` (
  `autor_id` int NOT NULL AUTO_INCREMENT,
  `eesnimi` varchar(50) NOT NULL,
  `perenimi` varchar(50) NOT NULL,
  `synniaasta` int DEFAULT NULL,
  PRIMARY KEY (`autor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autorid`
--

LOCK TABLES `autorid` WRITE;
/*!40000 ALTER TABLE `autorid` DISABLE KEYS */;
/*!40000 ALTER TABLE `autorid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laenutus`
--

DROP TABLE IF EXISTS `laenutus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laenutus` (
  `laenutus_id` int NOT NULL AUTO_INCREMENT,
  `lugeja_id` int DEFAULT NULL,
  `raamatu_id` int DEFAULT NULL,
  `laenutus_kp` date DEFAULT NULL,
  `tagastus_tp` date DEFAULT NULL,
  `tagastatud_kp` date DEFAULT NULL,
  PRIMARY KEY (`laenutus_id`),
  KEY `lugeja_id` (`lugeja_id`),
  KEY `raamatu_id` (`raamatu_id`),
  CONSTRAINT `laenutus_ibfk_1` FOREIGN KEY (`lugeja_id`) REFERENCES `lugejad` (`lugeja_id`),
  CONSTRAINT `laenutus_ibfk_2` FOREIGN KEY (`raamatu_id`) REFERENCES `raamatud` (`raamatu_id`),
  CONSTRAINT `laenutus_chk_1` CHECK ((`tagastus_tp` >= `laenutus_kp`))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laenutus`
--

LOCK TABLES `laenutus` WRITE;
/*!40000 ALTER TABLE `laenutus` DISABLE KEYS */;
INSERT INTO `laenutus` VALUES (1,1,1,'2025-04-01','2025-04-10','2025-04-15'),(2,1,1,'2025-04-01','2025-04-10','2025-04-15');
/*!40000 ALTER TABLE `laenutus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lugejad`
--

DROP TABLE IF EXISTS `lugejad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lugejad` (
  `lugeja_id` int NOT NULL AUTO_INCREMENT,
  `eesnimi` varchar(50) NOT NULL,
  `perenimi` varchar(50) NOT NULL,
  `telefon` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `aadress` varchar(200) DEFAULT NULL,
  `registreeritud` date DEFAULT NULL,
  PRIMARY KEY (`lugeja_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lugejad`
--

LOCK TABLES `lugejad` WRITE;
/*!40000 ALTER TABLE `lugejad` DISABLE KEYS */;
INSERT INTO `lugejad` VALUES (1,'Test','User',NULL,NULL,NULL,'2026-05-13'),(2,'Test','User',NULL,NULL,NULL,'2026-05-13');
/*!40000 ALTER TABLE `lugejad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raamatu_autor`
--

DROP TABLE IF EXISTS `raamatu_autor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raamatu_autor` (
  `raamatu_id` int NOT NULL,
  `autor_id` int NOT NULL,
  PRIMARY KEY (`raamatu_id`,`autor_id`),
  KEY `autor_id` (`autor_id`),
  CONSTRAINT `raamatu_autor_ibfk_1` FOREIGN KEY (`raamatu_id`) REFERENCES `raamatud` (`raamatu_id`),
  CONSTRAINT `raamatu_autor_ibfk_2` FOREIGN KEY (`autor_id`) REFERENCES `autorid` (`autor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raamatu_autor`
--

LOCK TABLES `raamatu_autor` WRITE;
/*!40000 ALTER TABLE `raamatu_autor` DISABLE KEYS */;
/*!40000 ALTER TABLE `raamatu_autor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raamatud`
--

DROP TABLE IF EXISTS `raamatud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raamatud` (
  `raamatu_id` int NOT NULL AUTO_INCREMENT,
  `pealkiri` varchar(200) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `aasta` int DEFAULT NULL,
  `keel` varchar(30) DEFAULT NULL,
  `eksemplare` int DEFAULT '1',
  `saadaval` int DEFAULT '1',
  PRIMARY KEY (`raamatu_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raamatud`
--

LOCK TABLES `raamatud` WRITE;
/*!40000 ALTER TABLE `raamatud` DISABLE KEYS */;
INSERT INTO `raamatud` VALUES (1,'Keisri hull',NULL,1978,'eesti',3,3),(2,'Rehepapp',NULL,2000,'eesti',4,4),(3,'Metro 2033',NULL,2005,'vene',2,2),(4,'1984',NULL,1949,'inglise',5,5),(5,'The Hobbit',NULL,1937,'inglise',3,3),(6,'Harry Potter',NULL,1997,'inglise',6,6),(7,'Master and Margarita',NULL,1967,'vene',2,2),(8,'War and Peace',NULL,1869,'vene',2,2);
/*!40000 ALTER TABLE `raamatud` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 13:22:04
