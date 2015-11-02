-- phpMyAdmin SQL Dump
-- version 3.5.8.1
-- http://www.phpmyadmin.net
--
-- Host: mugdev.com.mysql:3306
-- Generation Time: Nov 02, 2015 at 05:35 AM
-- Server version: 5.5.42-MariaDB-1~wheezy
-- PHP Version: 5.4.36-0+deb7u3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `mugdev_com`
--
CREATE DATABASE `mugdev_com` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `mugdev_com`;

-- --------------------------------------------------------

--
-- Table structure for table `Quotes`
--

CREATE TABLE IF NOT EXISTS `Quotes` (
  `QuoteID` int(255) NOT NULL AUTO_INCREMENT,
  `SongID` int(255) NOT NULL,
  `Time` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `Data` varchar(64759) NOT NULL,
  PRIMARY KEY (`QuoteID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=24 ;

-- --------------------------------------------------------

--
-- Table structure for table `commentVotes`
--

CREATE TABLE IF NOT EXISTS `commentVotes` (
  `voterID` int(11) NOT NULL,
  `commentID` int(11) NOT NULL AUTO_INCREMENT,
  `vote` int(2) NOT NULL,
  PRIMARY KEY (`commentID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE IF NOT EXISTS `comments` (
  `commenterID` int(11) NOT NULL,
  `songID` int(11) NOT NULL,
  `commentID` int(11) NOT NULL AUTO_INCREMENT,
  `commentTime` int(11) NOT NULL,
  `commentData` varchar(65480) NOT NULL,
  PRIMARY KEY (`commentID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE IF NOT EXISTS `follows` (
  `followerID` int(11) NOT NULL,
  `followeeID` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE IF NOT EXISTS `notifications` (
  `recipiantID` int(11) NOT NULL,
  `notificationID` int(255) NOT NULL AUTO_INCREMENT,
  `viewedStatus` int(2) NOT NULL,
  `notificationData` varchar(1024) NOT NULL,
  PRIMARY KEY (`notificationID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `songVotes`
--

CREATE TABLE IF NOT EXISTS `songVotes` (
  `voterID` int(11) NOT NULL,
  `songID` int(11) NOT NULL,
  `vote` int(2) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `songs`
--

CREATE TABLE IF NOT EXISTS `songs` (
  `name` varchar(512) NOT NULL,
  `songID` int(11) NOT NULL AUTO_INCREMENT,
  `creatorID` int(11) NOT NULL,
  `timeCreated` int(11) NOT NULL,
  `public` int(2) NOT NULL,
  `nps` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  PRIMARY KEY (`songID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=57 ;

-- --------------------------------------------------------

--
-- Table structure for table `tracker`
--

CREATE TABLE IF NOT EXISTS `tracker` (
  `ip` varchar(1024) NOT NULL,
  `time` varchar(1024) NOT NULL,
  `user` varchar(2048) NOT NULL,
  `song` varchar(2048) NOT NULL,
  `length` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tracks`
--

CREATE TABLE IF NOT EXISTS `tracks` (
  `trackID` int(15) NOT NULL AUTO_INCREMENT,
  `songID` int(11) NOT NULL,
  `instrument` varchar(256) NOT NULL,
  `trackData` varchar(64742) NOT NULL,
  `scale` varchar(512) NOT NULL,
  PRIMARY KEY (`trackID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=100 ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `username` varchar(512) NOT NULL,
  `password` varchar(512) NOT NULL,
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `sessionID` int(11) NOT NULL,
  `email` varchar(512) NOT NULL,
  `moderator` int(2) NOT NULL,
  `bannedUntil` int(11) NOT NULL,
  `donated` int(2) NOT NULL,
  `icon` varchar(512) NOT NULL,
  `bio` varchar(4086) NOT NULL,
  `age` int(11) NOT NULL,
  `birthday` int(11) NOT NULL,
  `gender` int(2) NOT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=110 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
