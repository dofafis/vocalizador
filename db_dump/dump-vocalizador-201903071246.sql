-- MySQL dump 10.13  Distrib 5.7.25, for Linux (x86_64)
--
-- Host: localhost    Database: vocalizador
-- ------------------------------------------------------
-- Server version	5.7.25-0ubuntu0.16.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cartao`
--

DROP TABLE IF EXISTS `cartao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cartao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `cartao_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartao`
--

LOCK TABLES `cartao` WRITE;
/*!40000 ALTER TABLE `cartao` DISABLE KEYS */;
INSERT INTO `cartao` VALUES (6,2,'Aniversário'),(7,2,'Dançar'),(8,2,'Jogar videogame'),(9,2,'Cantar'),(10,3,'Gato'),(11,3,'Vaca'),(12,3,'Cachorro'),(13,3,'Pato'),(14,3,'Peixe'),(15,3,'Girafa'),(16,4,'Cinto'),(17,4,'Botas'),(18,4,'Calça'),(19,4,'Camisa'),(20,4,'Short'),(21,4,'Tênis'),(22,4,'Meia'),(23,5,'Raiva'),(24,5,'Dor nas costas'),(25,5,'Cheiro ruim'),(26,5,'Frio'),(27,5,'Parabéns'),(28,6,'Maçã'),(29,6,'Suco de maçã'),(30,6,'Abacate'),(31,6,'Bacon'),(32,6,'Brócolis'),(33,6,'Bolo'),(34,7,'Faca de manteiga'),(35,7,'Cadeira'),(36,7,'Cabide'),(37,7,'Sofá'),(38,8,'Costas'),(39,8,'Peitoral'),(40,8,'Crianças'),(41,8,'Dançarina'),(42,9,'Mochila'),(43,9,'Bola'),(44,9,'Bíblia'),(45,9,'Livros'),(46,9,'Igreja'),(47,10,'Tomar banho'),(48,10,'Assoar o nariz'),(49,10,'Pentear o cabelo'),(50,11,'Machado'),(51,11,'Furadeira'),(52,11,'Extintor de incêndio'),(53,12,'Ambulância'),(54,12,'Bicicleta'),(55,12,'Minivan'),(56,12,'Carro de polícia');
/*!40000 ALTER TABLE `cartao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (2,'Atividades','Ações e entretenimento do dia-a-dia'),(3,'Animais','Animais em geral'),(4,'Roupas','Roupas preferidas de diversos tipos'),(5,'Comunicação','Emoções, comportamento, dor e sentidos em geral'),(6,'Comidas','Comidas mais comum em para cada refeição'),(7,'Casa','Cômodos e utensílios comuns de cada parte da casa'),(8,'Pessoas','Partes do corpo, grupos específicos, indivíduos'),(9,'Lugares','Hospitais, abrigos, igrejas, shopping e demais lugares comuns'),(10,'Ajuda','Pedir para determinadas ações que sejam necessárias, como se vestir ou tomar banho e etc'),(11,'Ferramentas','Ferramentas e utensílios comuns no dia-a-dia'),(12,'Transporte','Tipos de transporte comuns, como avião, ônibus, carro e etc');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `painel`
--

DROP TABLE IF EXISTS `painel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `painel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `painel_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `painel`
--

LOCK TABLES `painel` WRITE;
/*!40000 ALTER TABLE `painel` DISABLE KEYS */;
/*!40000 ALTER TABLE `painel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rel_painel_cartao`
--

DROP TABLE IF EXISTS `rel_painel_cartao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rel_painel_cartao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_painel` int(11) NOT NULL,
  `id_cartao` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rel_painel_cartao_UN` (`id_painel`,`id_cartao`),
  KEY `id_cartao` (`id_cartao`),
  KEY `id_painel` (`id_painel`),
  CONSTRAINT `rel_painel_cartao_ibfk_1` FOREIGN KEY (`id_cartao`) REFERENCES `cartao` (`id`),
  CONSTRAINT `rel_painel_cartao_ibfk_2` FOREIGN KEY (`id_painel`) REFERENCES `painel` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rel_painel_cartao`
--

LOCK TABLES `rel_painel_cartao` WRITE;
/*!40000 ALTER TABLE `rel_painel_cartao` DISABLE KEYS */;
/*!40000 ALTER TABLE `rel_painel_cartao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token`
--

DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `token` (
  `id` varchar(20) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `validade` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `token_usuario_FK` (`id_usuario`),
  CONSTRAINT `token_usuario_FK` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token`
--

LOCK TABLES `token` WRITE;
/*!40000 ALTER TABLE `token` DISABLE KEYS */;
INSERT INTO `token` VALUES ('1ltbbaosbchq9zn13dyo',7,'2019-02-27 15:36:26'),('1okrj6v1p6iqsyr4klzc',7,'2019-03-01 15:47:00'),('28o08eubrq0gusxikmho',7,'2019-03-01 14:12:07'),('4we3gd3t6bnv99a41fcw',7,'2019-02-27 16:20:44'),('51ojr7dukfxbelzumjve',7,'2019-02-22 18:11:19'),('58g1mo3un5y8h11o2ama',7,'2019-02-27 16:05:49'),('6qnlptym26fchmumgtkj',7,'2019-02-22 18:07:06'),('6qxdttm36d0rtbm41mjl',7,'2019-02-14 14:00:00'),('7ju7cslj7ce0274j7mld',7,'2019-02-28 15:49:23'),('84mzyxi4vxeiiainizs9',7,'2019-02-13 18:10:41'),('8lhj2rjvxj932wm4ocwc',7,'2019-03-07 15:42:50'),('8smjjp82jt06w54ucp1c',7,'2019-02-27 16:01:48'),('8xc2tlib9mpcab4l0jgl',7,'2019-02-27 17:08:49'),('9mg566y18qb4cljktcez',7,'2019-02-28 15:22:08'),('9vc6hizs6p18znv7h0zl',7,'2019-02-13 16:44:42'),('a0q2somyc13x7ikj5ypt',7,'2019-02-27 16:55:23'),('a3fk2336mg6eibvs6lex',7,'2019-03-01 17:09:46'),('ak5rf9yxrpj312rmqwfe',7,'2019-02-14 15:34:15'),('cvblnenvcv231mrph04g',7,'2019-02-11 06:14:01'),('di32u1n7elrg68qkmcct',7,'2019-02-12 02:42:45'),('dkhx6946b8plcr9f496a',7,'2019-02-27 15:37:17'),('dyvyixyu62fqchgecyoa',7,'2019-03-01 16:55:30'),('eszqk7ii4t6c9xy8k1fk',7,'2019-02-28 17:10:14'),('fc5r9zcbfxzg66dz9wu7',7,'2019-03-07 14:33:08'),('gobao45ryrcrycsgx5h0',7,'2019-02-14 16:56:06'),('h6euf58t95qnwet73e5i',7,'2019-02-28 17:04:28'),('hbt021o6xaqg0lvyhh2y',7,'2019-02-27 15:47:42'),('heu7qe84vd76858vvws1',7,'2019-02-28 14:10:09'),('hnh4thf6coti9b3jsfxa',7,'2019-03-01 15:13:17'),('js3grusy33k6kz0g8gs2',7,'2019-02-27 16:55:39'),('mdw7fuj2ucbg4jquguy3',7,'2019-02-28 14:57:10'),('n8gkathnb0m076bqoppl',7,'2019-03-01 14:17:51'),('naay1oe229yydynrzzkk',7,'2019-03-07 16:51:47'),('oh6jdtk12irkwe9f8vje',7,'2019-02-28 13:19:46'),('pabzgjw2bvwbmosphuhu',7,'2019-02-27 15:48:37'),('qmw9hxbnlzsa8bqe2cuc',7,'2019-02-28 17:04:49'),('sftdxff13oe8davpedw2',7,'2019-02-28 15:50:26'),('ub3vcgciwud4172x845m',7,'2019-02-27 16:08:58'),('utrc64rv4vrwamv87yjb',7,'2019-03-07 13:46:10'),('v9zlxiybe37ebh9k8hyh',7,'2019-02-15 14:24:09'),('vssur2wrprkmvu47z2j8',7,'2019-02-27 17:01:17'),('w7oghy8f6ursvh1l2t1d',7,'2019-03-07 13:45:01'),('wv6b2iw3t72c09z8x9w2',7,'2019-02-27 15:37:20'),('xqkppdy2uyvn3h3e9ua0',7,'2019-02-13 03:03:50'),('zokxinx59vni7qv42ty5',7,'2019-03-01 15:35:50'),('zpy9qkgivf1cqglx7mnv',7,'2019-03-01 18:04:17');
/*!40000 ALTER TABLE `token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  `sobrenome` varchar(150) NOT NULL,
  `login` varchar(50) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `adm` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_UN` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (6,'Lucas','Oliveira','dimitri','11150cc4e1ba522ee54aa4a43af83ccb9e0adce37a8a38b6467b9250b6ddb0ca','ldc@icomp.ufam.edu.br',1),(7,'Lucas','Oliveira','dofafis','11150cc4e1ba522ee54aa4a43af83ccb9e0adce37a8a38b6467b9250b6ddb0ca','lfo@icomp.ufam.edu.br',1),(10,'asd','asd','asd','3f3aad64f960cfc5bd0724737b3b63deea8ea2f513a40d0a41fccf17300c4b66','asd@asd.asd',0);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'vocalizador'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-03-07 12:46:17
