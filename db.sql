-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2025 at 08:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `intellicart-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `business_profiles`
--

CREATE TABLE `business_profiles` (
  `user_id` int(11) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_email` varchar(255) NOT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `business_type` enum('Sole Proprietorship','LLC','Corporation','Other') DEFAULT NULL,
  `product_category` varchar(100) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `owner_phone` varchar(20) DEFAULT NULL,
  `id_number` varchar(100) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `swift_code` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_profiles`
--

INSERT INTO `business_profiles` (`user_id`, `business_name`, `business_email`, `tax_id`, `website`, `business_type`, `product_category`, `owner_name`, `owner_phone`, `id_number`, `bank_name`, `account_number`, `swift_code`) VALUES
(2, 'Urban Glimmer', 'urbanglimmer@gmail.com', '12345', 'https://testcorp.com', 'Sole Proprietorship', 'Fashion', 'IntellicartTeam', '03163525668', '45505066729', 'Test Bank', '1234567890', '12345'),
(3, 'Luminary Lane', 'Luminarynaive@gmail.com', '12345', 'https://testcorp.com', 'LLC', 'Fashion', 'XYZ', '03163525668', '45505066729', 'Test Bank', '1234567890', '12345'),
(4, 'tech inovatives', 'techinovatives@gmail.com', '8888', 'https://testcorp.com', 'LLC', 'Fashion', 'Amaeda', '123456789', '45505066729', 'Test Bank', '1234567890', '12345');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `name`, `price`, `image`, `color`, `quantity`, `created_at`, `updated_at`) VALUES
(114, 4, '112', 'Wireless Noise Cancelling Headphones', 199.99, '/assets/images/Electronics/Wireless Noise Cancelling Headphones.jpg', 'Black', 1, '2025-06-13 17:00:13', '2025-06-13 17:00:13');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_type` varchar(256) NOT NULL,
  `user_id` varchar(256) NOT NULL,
  `item_id` varchar(256) NOT NULL,
  `time_stamp` datetime NOT NULL,
  `comment` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interactions`
--

CREATE TABLE `interactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `visitor_id` varchar(255) DEFAULT NULL,
  `item_id` int(11) NOT NULL,
  `event_type` enum('view','add_to_cart','order','review') NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `interactions`
--

INSERT INTO `interactions` (`id`, `user_id`, `visitor_id`, `item_id`, `event_type`, `metadata`, `created_at`, `updated_at`) VALUES
(1, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-05 20:47:41', '2025-06-05 20:47:41'),
(2, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:47:43', '2025-06-05 20:47:43'),
(3, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:47:43', '2025-06-05 20:47:43'),
(4, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{}\"', '2025-06-05 20:49:07', '2025-06-05 20:49:07'),
(5, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'add_to_cart', '\"{}\"', '2025-06-05 20:49:09', '2025-06-05 20:49:09'),
(6, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:49:12', '2025-06-05 20:49:12'),
(7, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:49:12', '2025-06-05 20:49:12'),
(8, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 14, 'view', '\"{}\"', '2025-06-05 20:50:32', '2025-06-05 20:50:32'),
(9, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 14, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:50:34', '2025-06-05 20:50:34'),
(10, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 14, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:50:34', '2025-06-05 20:50:34'),
(11, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 14, 'review', '\"{\\\"rating\\\":4,\\\"comment_length\\\":0}\"', '2025-06-05 20:50:48', '2025-06-05 20:50:48'),
(12, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 26, 'view', '\"{}\"', '2025-06-05 20:55:58', '2025-06-05 20:55:58'),
(13, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 26, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:56:01', '2025-06-05 20:56:01'),
(14, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 26, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:56:01', '2025-06-05 20:56:01'),
(15, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 22, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 20:56:11', '2025-06-05 20:56:11'),
(16, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'order', '\"{\\\"order_id\\\":\\\"ORD-1749157242407-CC7F3879\\\",\\\"quantity\\\":1,\\\"price\\\":49.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-05 21:00:42', '2025-06-05 21:00:42'),
(17, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 27, 'view', '\"{}\"', '2025-06-05 21:03:12', '2025-06-05 21:03:12'),
(18, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 27, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:03:15', '2025-06-05 21:03:15'),
(19, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 27, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:03:15', '2025-06-05 21:03:15'),
(20, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 27, 'order', '\"{\\\"order_id\\\":\\\"ORD-1749157429264-104F849D\\\",\\\"quantity\\\":1,\\\"price\\\":59.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-05 21:03:49', '2025-06-05 21:03:49'),
(21, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'view', '\"{}\"', '2025-06-05 21:04:57', '2025-06-05 21:04:57'),
(22, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:04:59', '2025-06-05 21:04:59'),
(23, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:04:59', '2025-06-05 21:04:59'),
(24, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'order', '\"{\\\"order_id\\\":\\\"ORD-1749157528756-06BB2D6C\\\",\\\"quantity\\\":1,\\\"price\\\":34.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-05 21:05:36', '2025-06-05 21:05:36'),
(25, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{}\"', '2025-06-05 21:08:44', '2025-06-05 21:08:44'),
(26, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:08:47', '2025-06-05 21:08:47'),
(27, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:08:47', '2025-06-05 21:08:47'),
(28, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{}\"', '2025-06-05 21:17:30', '2025-06-05 21:17:30'),
(29, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{}\"', '2025-06-05 21:17:31', '2025-06-05 21:17:31'),
(30, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:17:32', '2025-06-05 21:17:32'),
(31, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-05 21:17:33', '2025-06-05 21:17:33'),
(32, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-09 22:22:09', '2025-06-09 22:22:09'),
(33, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-09 22:22:11', '2025-06-09 22:22:11'),
(34, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-09 22:22:12', '2025-06-09 22:22:12'),
(35, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{}\"', '2025-06-09 22:24:58', '2025-06-09 22:24:58'),
(36, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-09 22:25:00', '2025-06-09 22:25:00'),
(37, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-09 22:25:00', '2025-06-09 22:25:00'),
(38, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{}\"', '2025-06-09 23:43:23', '2025-06-09 23:43:23'),
(39, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-09 23:43:26', '2025-06-09 23:43:26'),
(40, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-09 23:43:27', '2025-06-09 23:43:27'),
(43, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{}\"', '2025-06-10 05:57:50', '2025-06-10 05:57:50'),
(44, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 05:57:53', '2025-06-10 05:57:53'),
(45, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 05:57:53', '2025-06-10 05:57:53'),
(46, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:01:24', '2025-06-10 06:01:24'),
(47, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:01:24', '2025-06-10 06:01:24'),
(48, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 31, 'view', '\"{}\"', '2025-06-10 06:01:32', '2025-06-10 06:01:32'),
(49, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 31, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:01:35', '2025-06-10 06:01:35'),
(50, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 31, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:01:35', '2025-06-10 06:01:35'),
(51, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{}\"', '2025-06-10 06:02:30', '2025-06-10 06:02:30'),
(52, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:02:33', '2025-06-10 06:02:33'),
(53, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:02:33', '2025-06-10 06:02:33'),
(54, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'view', '\"{}\"', '2025-06-10 06:08:32', '2025-06-10 06:08:32'),
(55, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:08:35', '2025-06-10 06:08:35'),
(56, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:08:35', '2025-06-10 06:08:35'),
(57, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'order', '\"{\\\"order_id\\\":\\\"ORD-1749535752514-B5358118\\\",\\\"quantity\\\":1,\\\"price\\\":69.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-10 06:09:22', '2025-06-10 06:09:22'),
(58, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-10 06:14:26', '2025-06-10 06:14:26'),
(59, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:14:29', '2025-06-10 06:14:29'),
(60, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 06:14:29', '2025-06-10 06:14:29'),
(61, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'order', '\"{\\\"order_id\\\":\\\"ORD-1749536099470-98382CDB\\\",\\\"quantity\\\":5,\\\"price\\\":199.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-10 06:15:07', '2025-06-10 06:15:07'),
(62, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'view', '\"{}\"', '2025-06-10 22:27:40', '2025-06-10 22:27:40'),
(63, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 22:27:42', '2025-06-10 22:27:42'),
(64, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-10 22:27:42', '2025-06-10 22:27:42'),
(65, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'order', '\"{\\\"order_id\\\":\\\"ORD-1749594485661-D5500D51\\\",\\\"quantity\\\":1,\\\"price\\\":69.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-10 22:28:11', '2025-06-10 22:28:11'),
(66, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{}\"', '2025-06-11 15:10:22', '2025-06-11 15:10:22'),
(67, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-11 15:10:24', '2025-06-11 15:10:24'),
(68, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-11 15:10:25', '2025-06-11 15:10:25'),
(69, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{}\"', '2025-06-11 16:00:23', '2025-06-11 16:00:23'),
(70, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-11 16:00:26', '2025-06-11 16:00:26'),
(71, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-11 16:00:26', '2025-06-11 16:00:26'),
(72, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-12 01:05:15', '2025-06-12 01:05:15'),
(73, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 01:05:18', '2025-06-12 01:05:18'),
(74, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 01:05:18', '2025-06-12 01:05:18'),
(75, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 01:05:22', '2025-06-12 01:05:22'),
(76, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 01:07:23', '2025-06-12 01:07:23'),
(77, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 01:07:23', '2025-06-12 01:07:23'),
(78, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{}\"', '2025-06-12 07:44:26', '2025-06-12 07:44:26'),
(79, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 07:44:41', '2025-06-12 07:44:41'),
(80, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 07:44:41', '2025-06-12 07:44:41'),
(81, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 24, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 07:44:58', '2025-06-12 07:44:58'),
(82, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-12 07:45:15', '2025-06-12 07:45:15'),
(83, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 07:45:18', '2025-06-12 07:45:18'),
(84, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 07:45:18', '2025-06-12 07:45:18'),
(85, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 07:51:40', '2025-06-12 07:51:40'),
(86, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 07:51:40', '2025-06-12 07:51:40'),
(87, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 08:04:21', '2025-06-12 08:04:21'),
(88, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-12 08:04:21', '2025-06-12 08:04:21'),
(92, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-13 02:59:11', '2025-06-13 02:59:11'),
(93, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-13 02:59:14', '2025-06-13 02:59:14'),
(94, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-13 02:59:14', '2025-06-13 02:59:14'),
(95, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-13 02:59:56', '2025-06-13 02:59:56'),
(96, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-13 02:59:56', '2025-06-13 02:59:56'),
(100, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-13 17:01:06', '2025-06-13 17:01:06'),
(101, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-13 17:01:07', '2025-06-13 17:01:07'),
(102, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-13 17:01:08', '2025-06-13 17:01:08'),
(103, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-13 17:01:09', '2025-06-13 17:01:09'),
(104, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{}\"', '2025-06-19 01:55:25', '2025-06-19 01:55:25'),
(105, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-19 01:55:27', '2025-06-19 01:55:27'),
(106, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-19 01:55:27', '2025-06-19 01:55:27'),
(107, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 31, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-20 09:57:21', '2025-06-20 09:57:21'),
(108, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 31, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-20 09:57:21', '2025-06-20 09:57:21'),
(109, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-20 14:10:24', '2025-06-20 14:10:24'),
(110, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-20 14:10:24', '2025-06-20 14:10:24'),
(111, NULL, 'a1b2c3d4-e5f6-47b7-a157-8c6380dc34f1', 1, 'view', NULL, '2025-06-22 03:11:04', '2025-06-22 03:11:04'),
(112, NULL, 'a1b2c3d4-e5f6-47b7-a157-8c6380dc34f1', 3, 'add_to_cart', NULL, '2025-06-22 03:11:04', '2025-06-22 03:11:04'),
(113, NULL, 'a1b2c3d4-e5f6-47b7-a157-8c6380dc34f1', 7, 'order', NULL, '2025-06-22 03:11:04', '2025-06-22 03:11:04'),
(114, NULL, 'a1b2c3d4-e5f6-47b7-a157-8c6380dc34f1', 4, 'view', NULL, '2025-06-22 03:11:04', '2025-06-22 03:11:04'),
(115, NULL, 'b2c3d4e5-f6g7-47b7-a157-8c6380dc34f2', 6, 'view', NULL, '2025-06-22 03:11:52', '2025-06-22 03:11:52'),
(116, NULL, 'b2c3d4e5-f6g7-47b7-a157-8c6380dc34f2', 1, 'add_to_cart', NULL, '2025-06-22 03:11:52', '2025-06-22 03:11:52'),
(117, NULL, 'b2c3d4e5-f6g7-47b7-a157-8c6380dc34f2', 35, 'order', NULL, '2025-06-22 03:11:52', '2025-06-22 03:11:52'),
(118, NULL, 'b2c3d4e5-f6g7-47b7-a157-8c6380dc34f2', 7, 'view', NULL, '2025-06-22 03:11:52', '2025-06-22 03:11:52'),
(119, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', NULL, '2025-06-21 06:23:46', '2025-06-22 06:23:46'),
(120, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'add_to_cart', NULL, '2025-06-21 18:23:46', '2025-06-22 06:23:46'),
(121, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', NULL, '2025-06-20 06:23:46', '2025-06-22 06:23:46'),
(122, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'view', NULL, '2025-06-19 06:23:46', '2025-06-22 06:23:46'),
(123, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'order', NULL, '2025-06-21 06:23:46', '2025-06-22 06:23:46'),
(124, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', NULL, '2025-06-18 06:23:46', '2025-06-22 06:23:46'),
(125, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{}\"', '2025-06-22 07:45:07', '2025-06-22 07:45:07'),
(126, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 07:45:08', '2025-06-22 07:45:08'),
(127, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 07:45:08', '2025-06-22 07:45:08'),
(129, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750578485907-06590DD1\\\",\\\"quantity\\\":2,\\\"price\\\":59.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-22 07:48:10', '2025-06-22 07:48:10'),
(130, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 48, 'view', '\"{}\"', '2025-06-22 08:06:47', '2025-06-22 08:06:47'),
(131, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:06:48', '2025-06-22 08:06:48'),
(132, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:06:48', '2025-06-22 08:06:48'),
(133, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 10, 'view', '\"{}\"', '2025-06-22 08:07:08', '2025-06-22 08:07:08'),
(134, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:07:09', '2025-06-22 08:07:09'),
(135, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:07:09', '2025-06-22 08:07:09'),
(136, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 13, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:07:12', '2025-06-22 08:07:12'),
(137, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:07:16', '2025-06-22 08:07:16'),
(138, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 14, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:07:19', '2025-06-22 08:07:19'),
(139, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:07:25', '2025-06-22 08:07:25'),
(140, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 10, 'view', '\"{}\"', '2025-06-22 08:08:19', '2025-06-22 08:08:19'),
(141, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:08:23', '2025-06-22 08:08:23'),
(142, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:08:24', '2025-06-22 08:08:24'),
(143, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 1, 'view', '\"{}\"', '2025-06-22 08:17:39', '2025-06-22 08:17:39'),
(144, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:17:39', '2025-06-22 08:17:39'),
(145, NULL, '17b02671-6ee8-4843-b352-fcdf267bae55', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:17:39', '2025-06-22 08:17:39'),
(146, NULL, '3c845f35-3d60-4925-ad25-47a8c0f49ea3', 48, 'view', '\"{}\"', '2025-06-22 08:40:27', '2025-06-22 08:40:27'),
(147, NULL, '3c845f35-3d60-4925-ad25-47a8c0f49ea3', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:40:28', '2025-06-22 08:40:28'),
(148, NULL, '3c845f35-3d60-4925-ad25-47a8c0f49ea3', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:40:29', '2025-06-22 08:40:29'),
(149, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{}\"', '2025-06-22 08:40:59', '2025-06-22 08:40:59'),
(150, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:40:59', '2025-06-22 08:40:59'),
(151, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:40:59', '2025-06-22 08:40:59'),
(152, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:41:18', '2025-06-22 08:41:18'),
(153, NULL, '3c845f35-3d60-4925-ad25-47a8c0f49ea3', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 08:41:18', '2025-06-22 08:41:18'),
(154, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-22 09:31:36', '2025-06-22 09:31:36'),
(155, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 09:31:36', '2025-06-22 09:31:36'),
(156, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 09:31:37', '2025-06-22 09:31:37'),
(157, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750584757071-19674ED1\\\",\\\"quantity\\\":1,\\\"price\\\":39.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-22 09:32:41', '2025-06-22 09:32:41'),
(158, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-22 11:28:21', '2025-06-22 11:28:21'),
(159, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:28:22', '2025-06-22 11:28:22'),
(160, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:28:22', '2025-06-22 11:28:22'),
(161, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-22 11:29:07', '2025-06-22 11:29:07'),
(162, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:29:07', '2025-06-22 11:29:07'),
(163, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:29:07', '2025-06-22 11:29:07'),
(164, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{}\"', '2025-06-22 11:29:44', '2025-06-22 11:29:44'),
(165, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:29:45', '2025-06-22 11:29:45'),
(166, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:29:45', '2025-06-22 11:29:45'),
(167, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-22 11:33:51', '2025-06-22 11:33:51'),
(168, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:33:51', '2025-06-22 11:33:51'),
(169, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:33:51', '2025-06-22 11:33:51'),
(170, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:39:49', '2025-06-22 11:39:49'),
(171, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:39:49', '2025-06-22 11:39:49'),
(172, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{}\"', '2025-06-22 11:40:03', '2025-06-22 11:40:03'),
(173, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:40:03', '2025-06-22 11:40:03'),
(174, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:40:03', '2025-06-22 11:40:03'),
(175, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:41:07', '2025-06-22 11:41:07'),
(176, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 20, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:41:11', '2025-06-22 11:41:11'),
(177, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{}\"', '2025-06-22 11:41:23', '2025-06-22 11:41:23'),
(178, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:41:23', '2025-06-22 11:41:23'),
(179, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:41:23', '2025-06-22 11:41:23'),
(180, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{}\"', '2025-06-22 11:41:39', '2025-06-22 11:41:39'),
(181, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:41:39', '2025-06-22 11:41:39'),
(182, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:41:39', '2025-06-22 11:41:39'),
(183, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:48:32', '2025-06-22 11:48:32'),
(184, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:48:32', '2025-06-22 11:48:32'),
(185, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:51:12', '2025-06-22 11:51:12'),
(186, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 11:51:12', '2025-06-22 11:51:12'),
(187, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:01:25', '2025-06-22 12:01:25'),
(188, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:01:25', '2025-06-22 12:01:25'),
(189, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{}\"', '2025-06-22 12:01:38', '2025-06-22 12:01:38'),
(190, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:01:38', '2025-06-22 12:01:38'),
(191, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:01:38', '2025-06-22 12:01:38'),
(192, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{}\"', '2025-06-22 12:01:50', '2025-06-22 12:01:50'),
(193, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:01:50', '2025-06-22 12:01:50'),
(194, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:01:50', '2025-06-22 12:01:50'),
(195, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{}\"', '2025-06-22 12:02:08', '2025-06-22 12:02:08'),
(196, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:02:08', '2025-06-22 12:02:08'),
(197, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:02:08', '2025-06-22 12:02:08'),
(198, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 48, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:02:13', '2025-06-22 12:02:13'),
(199, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:02:23', '2025-06-22 12:02:23'),
(200, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{}\"', '2025-06-22 12:02:37', '2025-06-22 12:02:37'),
(201, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:02:37', '2025-06-22 12:02:37'),
(202, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:02:37', '2025-06-22 12:02:37'),
(203, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:04:53', '2025-06-22 12:04:53'),
(204, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:04:53', '2025-06-22 12:04:53'),
(205, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 22, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:05:02', '2025-06-22 12:05:02'),
(206, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 26, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:05:16', '2025-06-22 12:05:16'),
(207, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{}\"', '2025-06-22 12:08:26', '2025-06-22 12:08:26'),
(208, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:08:26', '2025-06-22 12:08:26'),
(209, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:08:27', '2025-06-22 12:08:27'),
(210, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:09:34', '2025-06-22 12:09:34'),
(211, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:11:12', '2025-06-22 12:11:12'),
(212, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:11:12', '2025-06-22 12:11:12'),
(213, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-22 12:11:34', '2025-06-22 12:11:34'),
(214, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:11:35', '2025-06-22 12:11:35'),
(215, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:11:35', '2025-06-22 12:11:35'),
(216, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:11:46', '2025-06-22 12:11:46'),
(217, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:11:55', '2025-06-22 12:11:55'),
(218, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:00', '2025-06-22 12:12:00'),
(219, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{}\"', '2025-06-22 12:12:09', '2025-06-22 12:12:09'),
(220, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:09', '2025-06-22 12:12:09'),
(221, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:09', '2025-06-22 12:12:09'),
(222, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{}\"', '2025-06-22 12:12:20', '2025-06-22 12:12:20'),
(223, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:20', '2025-06-22 12:12:20'),
(224, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 25, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:20', '2025-06-22 12:12:20'),
(225, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:30', '2025-06-22 12:12:30'),
(226, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:35', '2025-06-22 12:12:35'),
(227, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 29, 'view', '\"{}\"', '2025-06-22 12:12:49', '2025-06-22 12:12:49'),
(228, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 29, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:49', '2025-06-22 12:12:49'),
(229, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 29, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:12:49', '2025-06-22 12:12:49'),
(230, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 38, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:13:01', '2025-06-22 12:13:01'),
(231, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 36, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:13:14', '2025-06-22 12:13:14'),
(232, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 36, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:15:16', '2025-06-22 12:15:16'),
(233, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 36, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:15:16', '2025-06-22 12:15:16'),
(234, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{}\"', '2025-06-22 12:15:28', '2025-06-22 12:15:28'),
(235, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:15:28', '2025-06-22 12:15:28'),
(236, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:15:28', '2025-06-22 12:15:28'),
(237, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{}\"', '2025-06-22 12:15:57', '2025-06-22 12:15:57'),
(238, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:15:57', '2025-06-22 12:15:57'),
(239, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:15:57', '2025-06-22 12:15:57'),
(240, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"\\\"}\"', '2025-06-22 12:16:02', '2025-06-22 12:16:02'),
(242, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-22 12:17:37', '2025-06-22 12:17:37'),
(243, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:17:37', '2025-06-22 12:17:37'),
(244, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:17:37', '2025-06-22 12:17:37'),
(245, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:17:42', '2025-06-22 12:17:42'),
(246, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:17:46', '2025-06-22 12:17:46'),
(247, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:17:52', '2025-06-22 12:17:52'),
(248, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Black\\\"}\"', '2025-06-22 12:17:56', '2025-06-22 12:17:56'),
(249, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750594696933-92847AC6\\\",\\\"quantity\\\":1,\\\"price\\\":129.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-22 12:18:23', '2025-06-22 12:18:23'),
(250, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{}\"', '2025-06-22 12:19:28', '2025-06-22 12:19:28'),
(251, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:19:28', '2025-06-22 12:19:28'),
(252, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:19:28', '2025-06-22 12:19:28'),
(253, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 32, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:19:31', '2025-06-22 12:19:31'),
(254, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 29, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:19:35', '2025-06-22 12:19:35'),
(255, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:19:41', '2025-06-22 12:19:41'),
(256, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{}\"', '2025-06-22 12:27:30', '2025-06-22 12:27:30'),
(257, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:27:31', '2025-06-22 12:27:31'),
(258, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:27:31', '2025-06-22 12:27:31'),
(259, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"White\\\"}\"', '2025-06-22 12:27:34', '2025-06-22 12:27:34'),
(260, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:27:41', '2025-06-22 12:27:41'),
(261, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Navy\\\"}\"', '2025-06-22 12:27:43', '2025-06-22 12:27:43'),
(262, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 13, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 12:27:58', '2025-06-22 12:27:58'),
(263, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750595310577-EEDB3C50\\\",\\\"quantity\\\":1,\\\"price\\\":39.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-22 12:28:41', '2025-06-22 12:28:41'),
(264, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750595310577-EEDB3C50\\\",\\\"quantity\\\":1,\\\"price\\\":29.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-22 12:28:41', '2025-06-22 12:28:41'),
(265, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'view', '\"{}\"', '2025-06-22 13:01:15', '2025-06-22 13:01:15'),
(266, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:01:16', '2025-06-22 13:01:16'),
(267, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:01:16', '2025-06-22 13:01:16'),
(268, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{}\"', '2025-06-22 13:08:43', '2025-06-22 13:08:43'),
(269, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:08:44', '2025-06-22 13:08:44'),
(270, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:08:44', '2025-06-22 13:08:44'),
(271, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{}\"', '2025-06-22 13:16:51', '2025-06-22 13:16:51'),
(272, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:16:52', '2025-06-22 13:16:52'),
(273, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:16:52', '2025-06-22 13:16:52'),
(274, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{}\"', '2025-06-22 13:27:01', '2025-06-22 13:27:01'),
(275, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:27:01', '2025-06-22 13:27:01'),
(276, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:27:01', '2025-06-22 13:27:01'),
(277, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:27:14', '2025-06-22 13:27:14'),
(278, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{}\"', '2025-06-22 13:42:27', '2025-06-22 13:42:27'),
(279, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:42:27', '2025-06-22 13:42:27'),
(280, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:42:27', '2025-06-22 13:42:27'),
(281, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{}\"', '2025-06-22 13:52:21', '2025-06-22 13:52:21'),
(282, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:52:21', '2025-06-22 13:52:21'),
(283, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 19, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:52:21', '2025-06-22 13:52:21'),
(284, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 17, 'add_to_cart', '\"{\\\"source\\\":\\\"recommended_products\\\",\\\"quantity\\\":1}\"', '2025-06-22 13:52:39', '2025-06-22 13:52:39'),
(285, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{}\"', '2025-06-22 13:53:08', '2025-06-22 13:53:08'),
(286, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:53:08', '2025-06-22 13:53:08'),
(287, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 8, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:53:08', '2025-06-22 13:53:08'),
(288, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 14, 'view', '\"{}\"', '2025-06-22 13:54:01', '2025-06-22 13:54:01'),
(289, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 14, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:54:01', '2025-06-22 13:54:01'),
(290, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 14, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:54:01', '2025-06-22 13:54:01'),
(291, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{}\"', '2025-06-22 13:56:40', '2025-06-22 13:56:40'),
(292, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:56:41', '2025-06-22 13:56:41'),
(293, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 13:56:41', '2025-06-22 13:56:41'),
(294, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'view', '\"{}\"', '2025-06-22 14:00:56', '2025-06-22 14:00:56'),
(295, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:00:57', '2025-06-22 14:00:57'),
(296, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 10, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:00:57', '2025-06-22 14:00:57'),
(297, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 38, 'view', '\"{}\"', '2025-06-22 14:03:14', '2025-06-22 14:03:14'),
(298, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 38, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:03:14', '2025-06-22 14:03:14'),
(299, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 38, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:03:14', '2025-06-22 14:03:14'),
(300, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 38, 'review', '\"{\\\"rating\\\":4,\\\"comment_length\\\":0}\"', '2025-06-22 14:03:32', '2025-06-22 14:03:32'),
(301, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 35, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:06:09', '2025-06-22 14:06:09'),
(302, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-22 14:06:52', '2025-06-22 14:06:52'),
(303, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-22 14:06:54', '2025-06-22 14:06:54'),
(304, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:06:55', '2025-06-22 14:06:55'),
(305, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:06:55', '2025-06-22 14:06:55'),
(306, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{}\"', '2025-06-22 14:21:01', '2025-06-22 14:21:01'),
(307, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:21:01', '2025-06-22 14:21:01'),
(308, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:21:01', '2025-06-22 14:21:01'),
(309, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:25:29', '2025-06-22 14:25:29'),
(310, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:25:29', '2025-06-22 14:25:29'),
(311, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{}\"', '2025-06-22 14:34:10', '2025-06-22 14:34:10'),
(312, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:34:11', '2025-06-22 14:34:11'),
(313, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:34:11', '2025-06-22 14:34:11'),
(314, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Blue\\\"}\"', '2025-06-22 14:36:38', '2025-06-22 14:36:38'),
(315, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{}\"', '2025-06-22 14:47:42', '2025-06-22 14:47:42'),
(316, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:47:42', '2025-06-22 14:47:42'),
(317, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 14:47:42', '2025-06-22 14:47:42'),
(318, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 12, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Blue\\\"}\"', '2025-06-22 14:47:48', '2025-06-22 14:47:48'),
(319, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{}\"', '2025-06-22 15:50:59', '2025-06-22 15:50:59'),
(320, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 15:51:00', '2025-06-22 15:51:00'),
(321, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 9, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 15:51:00', '2025-06-22 15:51:00'),
(322, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'add_to_cart', '\"{}\"', '2025-06-22 15:54:01', '2025-06-22 15:54:01'),
(323, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{}\"', '2025-06-22 15:55:31', '2025-06-22 15:55:31'),
(324, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 15:55:31', '2025-06-22 15:55:31'),
(325, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 15:55:31', '2025-06-22 15:55:31'),
(326, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'review', '\"{\\\"rating\\\":5,\\\"comment_length\\\":0}\"', '2025-06-22 15:57:01', '2025-06-22 15:57:01'),
(327, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{}\"', '2025-06-22 16:09:26', '2025-06-22 16:09:26'),
(328, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:09:26', '2025-06-22 16:09:26'),
(329, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:09:26', '2025-06-22 16:09:26'),
(330, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{}\"', '2025-06-22 16:17:26', '2025-06-22 16:17:26'),
(331, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:17:26', '2025-06-22 16:17:26'),
(332, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:17:26', '2025-06-22 16:17:26'),
(333, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'view', '\"{}\"', '2025-06-22 16:30:12', '2025-06-22 16:30:12'),
(334, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:30:12', '2025-06-22 16:30:12'),
(335, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 23, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:30:12', '2025-06-22 16:30:12'),
(336, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:37:36', '2025-06-22 16:37:36');
INSERT INTO `interactions` (`id`, `user_id`, `visitor_id`, `item_id`, `event_type`, `metadata`, `created_at`, `updated_at`) VALUES
(337, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:37:36', '2025-06-22 16:37:36'),
(338, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:58:23', '2025-06-22 16:58:23'),
(339, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-22 16:58:23', '2025-06-22 16:58:23'),
(340, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{}\"', '2025-06-23 03:56:57', '2025-06-23 03:56:57'),
(341, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 03:56:58', '2025-06-23 03:56:58'),
(342, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 15, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 03:56:58', '2025-06-23 03:56:58'),
(343, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 22, 'view', '\"{}\"', '2025-06-23 03:57:36', '2025-06-23 03:57:36'),
(344, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 22, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 03:57:36', '2025-06-23 03:57:36'),
(345, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 22, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 03:57:36', '2025-06-23 03:57:36'),
(346, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 22, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 04:29:48', '2025-06-23 04:29:48'),
(347, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 22, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 04:29:48', '2025-06-23 04:29:48'),
(348, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 04:29:57', '2025-06-23 04:29:57'),
(349, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{}\"', '2025-06-23 05:45:07', '2025-06-23 05:45:07'),
(350, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 05:45:10', '2025-06-23 05:45:10'),
(351, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 05:45:10', '2025-06-23 05:45:10'),
(352, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Blue\\\"}\"', '2025-06-23 05:45:14', '2025-06-23 05:45:14'),
(353, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Blue\\\"}\"', '2025-06-23 05:45:23', '2025-06-23 05:45:23'),
(354, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{}\"', '2025-06-23 06:21:24', '2025-06-23 06:21:24'),
(355, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 06:21:24', '2025-06-23 06:21:24'),
(356, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 06:21:24', '2025-06-23 06:21:24'),
(357, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 07:10:22', '2025-06-23 07:10:22'),
(358, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 1, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 07:10:22', '2025-06-23 07:10:22'),
(359, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{}\"', '2025-06-23 07:10:43', '2025-06-23 07:10:43'),
(360, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 07:10:43', '2025-06-23 07:10:43'),
(361, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 07:10:43', '2025-06-23 07:10:43'),
(362, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{}\"', '2025-06-23 08:16:12', '2025-06-23 08:16:12'),
(363, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 08:16:15', '2025-06-23 08:16:15'),
(364, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 08:16:15', '2025-06-23 08:16:15'),
(365, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{}\"', '2025-06-23 08:52:42', '2025-06-23 08:52:42'),
(366, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 08:52:44', '2025-06-23 08:52:44'),
(367, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-23 08:52:44', '2025-06-23 08:52:44'),
(368, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Black\\\"}\"', '2025-06-23 08:52:49', '2025-06-23 08:52:49'),
(369, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750668785943-BB653C01\\\",\\\"quantity\\\":1,\\\"price\\\":39.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-23 08:53:09', '2025-06-23 08:53:09'),
(370, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{}\"', '2025-06-24 05:42:09', '2025-06-24 05:42:09'),
(371, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{}\"', '2025-06-24 05:42:11', '2025-06-24 05:42:11'),
(372, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 05:42:12', '2025-06-24 05:42:12'),
(373, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 05:42:12', '2025-06-24 05:42:12'),
(374, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Blue\\\"}\"', '2025-06-24 05:42:19', '2025-06-24 05:42:19'),
(375, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{}\"', '2025-06-24 05:59:58', '2025-06-24 05:59:58'),
(376, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 05:59:58', '2025-06-24 05:59:58'),
(377, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 05:59:58', '2025-06-24 05:59:58'),
(378, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 06:00:03', '2025-06-24 06:00:03'),
(379, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 06:00:03', '2025-06-24 06:00:03'),
(380, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Black\\\"}\"', '2025-06-24 06:00:06', '2025-06-24 06:00:06'),
(381, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 06:31:42', '2025-06-24 06:31:42'),
(382, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 06:31:42', '2025-06-24 06:31:42'),
(383, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{}\"', '2025-06-24 09:44:03', '2025-06-24 09:44:03'),
(384, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 09:44:05', '2025-06-24 09:44:05'),
(385, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 09:44:05', '2025-06-24 09:44:05'),
(386, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 27, 'add_to_cart', '\"{}\"', '2025-06-24 09:51:04', '2025-06-24 09:51:04'),
(387, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{}\"', '2025-06-24 09:51:17', '2025-06-24 09:51:17'),
(388, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 09:51:17', '2025-06-24 09:51:17'),
(389, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 28, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 09:51:17', '2025-06-24 09:51:17'),
(390, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{}\"', '2025-06-24 10:02:16', '2025-06-24 10:02:16'),
(391, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 10:02:16', '2025-06-24 10:02:16'),
(392, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 10:02:16', '2025-06-24 10:02:16'),
(393, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{}\"', '2025-06-24 10:45:36', '2025-06-24 10:45:36'),
(394, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 10:45:36', '2025-06-24 10:45:36'),
(395, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 10:45:36', '2025-06-24 10:45:36'),
(396, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750764681554-FC4140EB\\\",\\\"quantity\\\":1,\\\"price\\\":39.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-24 11:31:25', '2025-06-24 11:31:25'),
(397, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 21, 'add_to_cart', '\"{}\"', '2025-06-24 11:44:57', '2025-06-24 11:44:57'),
(398, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{}\"', '2025-06-24 11:53:41', '2025-06-24 11:53:41'),
(399, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:53:41', '2025-06-24 11:53:41'),
(400, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 30, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:53:41', '2025-06-24 11:53:41'),
(401, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 27, 'add_to_cart', '\"{\\\"source\\\":\\\"recommended_products\\\",\\\"quantity\\\":1}\"', '2025-06-24 11:53:48', '2025-06-24 11:53:48'),
(402, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{}\"', '2025-06-24 11:54:11', '2025-06-24 11:54:11'),
(403, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:54:12', '2025-06-24 11:54:12'),
(404, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 3, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:54:12', '2025-06-24 11:54:12'),
(405, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 7, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:54:15', '2025-06-24 11:54:15'),
(406, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:54:19', '2025-06-24 11:54:19'),
(407, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 5, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:54:23', '2025-06-24 11:54:23'),
(408, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 4, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 11:54:28', '2025-06-24 11:54:28'),
(411, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 27, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750766114779-4F58037C\\\",\\\"quantity\\\":1,\\\"price\\\":59.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-24 11:55:22', '2025-06-24 11:55:22'),
(412, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{}\"', '2025-06-24 14:07:53', '2025-06-24 14:07:53'),
(413, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 14:07:56', '2025-06-24 14:07:56'),
(414, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 14:07:56', '2025-06-24 14:07:56'),
(415, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 17, 'add_to_cart', '\"{}\"', '2025-06-24 14:10:51', '2025-06-24 14:10:51'),
(416, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 17, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750774276200-3144C941\\\",\\\"quantity\\\":1,\\\"price\\\":19.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-24 14:11:27', '2025-06-24 14:11:27'),
(417, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 16, 'view', '\"{}\"', '2025-06-24 14:11:40', '2025-06-24 14:11:40'),
(418, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 16, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 14:11:40', '2025-06-24 14:11:40'),
(419, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 16, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 14:11:40', '2025-06-24 14:11:40'),
(420, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 16, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Silver\\\"}\"', '2025-06-24 14:13:21', '2025-06-24 14:13:21'),
(421, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 16, 'add_to_cart', '\"{\\\"source\\\":\\\"product_details_page\\\",\\\"quantity\\\":1,\\\"color\\\":\\\"Silver\\\"}\"', '2025-06-24 14:13:23', '2025-06-24 14:13:23'),
(422, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 16, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750774432013-FDF373C7\\\",\\\"quantity\\\":2,\\\"price\\\":149.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-24 14:13:56', '2025-06-24 14:13:56'),
(426, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 2, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750787319248-60D67B5B\\\",\\\"quantity\\\":1,\\\"price\\\":89.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-24 17:48:42', '2025-06-24 17:48:42'),
(427, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 6, 'order', '\"{\\\"order_id\\\":\\\"ORD-1750787319248-60D67B5B\\\",\\\"quantity\\\":1,\\\"price\\\":39.99,\\\"payment_method\\\":\\\"cod\\\"}\"', '2025-06-24 17:48:42', '2025-06-24 17:48:42'),
(428, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{}\"', '2025-06-24 18:09:09', '2025-06-24 18:09:09'),
(429, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 18:09:09', '2025-06-24 18:09:09'),
(430, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 18:09:09', '2025-06-24 18:09:09'),
(431, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 18:09:22', '2025-06-24 18:09:22'),
(432, NULL, 'e0ef77fa-6e00-47b7-a157-8c6380dc34f0', 55, 'view', '\"{\\\"source\\\":\\\"product_details_page\\\"}\"', '2025-06-24 18:09:22', '2025-06-24 18:09:22');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `item_id` varchar(256) NOT NULL,
  `is_hidden` tinyint(1) NOT NULL,
  `categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `time_stamp` datetime NOT NULL,
  `labels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `comment` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_email` varchar(255) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_first_name` varchar(100) NOT NULL,
  `shipping_last_name` varchar(100) NOT NULL,
  `shipping_email` varchar(255) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_address` varchar(500) NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_state` varchar(100) NOT NULL,
  `shipping_zip` varchar(20) NOT NULL,
  `shipping_country` varchar(100) NOT NULL,
  `payment_method` enum('cod','card','paypal') DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_id`, `user_id`, `user_email`, `status`, `total_amount`, `shipping_first_name`, `shipping_last_name`, `shipping_email`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_zip`, `shipping_country`, `payment_method`, `payment_status`, `created_at`, `updated_at`) VALUES
(1, 'ORD-1749157242407-CC7F3879', 1, 'amaedaqureshi@gmail.com', 'cancelled', 63.98, 'Amaeda', 'Qureshi', 'amaedaqureshi@gmail.com', '03163525668', 'adress here, nothing', 'idk', 'AL', '12345', 'US', 'cod', 'pending', '2025-06-05 21:00:42', '2025-06-24 07:48:10'),
(2, 'ORD-1749157429264-104F849D', 1, 'amaedaqureshi@gmail.com', 'cancelled', 74.78, 'Amaeda', 'Qureshi', 'amaedaqureshi@gmail.com', '03163525668', 'adress here, nothing', 'idk', 'AL', '12345', 'US', 'cod', 'pending', '2025-06-05 21:03:49', '2025-06-24 10:11:55'),
(3, 'ORD-1749157528756-06BB2D6C', 1, 'amaedaqureshi@gmail.com', 'shipped', 47.78, 'Amaeda', 'Qureshi', 'amaedaqureshi@gmail.com', '03163525668', 'adress here, nothing', 'idk', 'AL', '12345', 'US', 'cod', 'pending', '2025-06-05 21:05:28', '2025-06-10 22:22:34'),
(4, 'ORD-1749535752514-B5358118', 2, 'urbanglimmer@gmail.com', 'pending', 85.58, 'Amaeda', 'Qureshi', 'amaedaqureshi@gmail.com', '03163525668', 'adress here, nothing', 'idk', 'AL', '12345', 'US', 'cod', 'pending', '2025-06-10 06:09:12', '2025-06-10 06:09:12'),
(5, 'ORD-1749536099470-98382CDB', 2, 'urbanglimmer@gmail.com', 'processing', 1079.95, 'Amaeda', 'Qureshi', 'amaedaqureshi@gmail.com', '03163525668', 'adress here, nothing', 'idk', 'AL', '12345', 'US', 'cod', 'pending', '2025-06-10 06:14:59', '2025-06-10 22:12:05'),
(6, 'ORD-1749594485661-D5500D51', 1, 'amaedaqureshi@gmail.com', 'delivered', 85.58, 'Amaeda', 'Qureshi', 'amaedaqureshi@gmail.com', '03163525668', 'adress here, nothing', 'idk', 'AL', '12345', 'US', 'cod', 'pending', '2025-06-10 22:28:05', '2025-06-11 15:58:00'),
(7, 'ORD-1750578485907-06590DD1', 1, 'amaedaqureshi@gmail.com', 'pending', 345.57, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, nothing', 'sukkur', 'CA', '12345', 'US', 'cod', 'pending', '2025-06-22 07:48:05', '2025-06-22 07:48:05'),
(8, 'ORD-1750584757071-19674ED1', 1, 'amaedaqureshi@gmail.com', 'shipped', 53.18, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, nothing', 'Karachi', 'CA', '12345', 'US', 'cod', 'pending', '2025-06-22 09:32:37', '2025-06-24 18:11:42'),
(9, 'ORD-1750594593192-563025C1', 1, 'amaedaqureshi@gmail.com', 'pending', 63.98, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, nothing', 'Karachi', 'CA', '65200', 'US', 'cod', 'pending', '2025-06-22 12:16:33', '2025-06-22 12:16:33'),
(10, 'ORD-1750594696933-92847AC6', 1, 'amaedaqureshi@gmail.com', 'cancelled', 140.39, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, nothing', 'Karachi', 'CA', '65200', 'US', 'cod', 'pending', '2025-06-22 12:18:16', '2025-06-24 08:49:52'),
(11, 'ORD-1750595310577-EEDB3C50', 1, 'amaedaqureshi@gmail.com', 'cancelled', 85.57, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, nothing', 'Karachi', 'CA', '12345', 'US', 'cod', 'pending', '2025-06-22 12:28:30', '2025-06-24 07:03:03'),
(12, 'ORD-1750668785943-BB653C01', 2, 'urbanglimmer@gmail.com', 'processing', 53.18, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, nothing', 'Karachi', 'CA', '65200', 'US', 'cod', 'pending', '2025-06-23 08:53:05', '2025-06-24 11:22:25'),
(13, 'ORD-1750764681554-FC4140EB', 1, 'amaedaqureshi@gmail.com', 'pending', 53.18, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, vhvjjj', 'sukkur', 'sindh', '12345', 'US', 'cod', 'pending', '2025-06-24 11:31:21', '2025-06-24 11:31:21'),
(14, 'ORD-1750766114779-4F58037C', 1, 'amaedaqureshi@gmail.com', 'pending', 161.97, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, vhvjjj', 'sukkur', 'sindh', '65200', 'US', 'cod', 'pending', '2025-06-24 11:55:14', '2025-06-24 11:55:14'),
(15, 'ORD-1750774276200-3144C941', 1, 'amaedaqureshi@gmail.com', 'processing', 31.58, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, vhvjjj', 'sukkur', 'sindh', '65200', 'US', 'cod', 'pending', '2025-06-24 14:11:16', '2025-06-24 17:23:06'),
(16, 'ORD-1750774432013-FDF373C7', 1, 'amaedaqureshi@gmail.com', 'pending', 323.98, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, vhvjjj', 'sukkur', 'sindh', '65200', 'US', 'cod', 'pending', '2025-06-24 14:13:52', '2025-06-24 14:13:52'),
(17, 'ORD-1750786846633-BEFCD45F', 2, 'urbanglimmer@gmail.com', 'pending', 259.17, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, vhvjjj', 'Karachi', 'sindh', '65200', 'US', 'cod', 'pending', '2025-06-24 17:40:46', '2025-06-24 17:40:46'),
(18, 'ORD-1750787319248-60D67B5B', 5, 'amaeda@gmail.com', 'pending', 160.37, 'Amaeda', 'Q', 'amaedaqureshi259@gmail.com', '03163525668', 'bfrbkjbvfelnvf;lrm, vhvjjj', 'Karachi', 'sindh', '65200', 'US', 'cod', 'pending', '2025-06-24 17:48:39', '2025-06-24 17:48:39');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `image`, `color`, `quantity`, `subtotal`, `created_at`) VALUES
(1, 'ORD-1749157242407-CC7F3879', '21', 'Silk Hydration Serum', 49.99, '/assets/images/Beauty/Silk Hydration Serum.png', 'default', 1, 49.99, '2025-06-05 21:00:42'),
(2, 'ORD-1749157429264-104F849D', '27', 'Wooden Magnetic Tiles (102pc)', 59.99, '/assets/images/Toys and Games/wooden-magnetic-tiles.png', '', 1, 59.99, '2025-06-05 21:03:49'),
(3, 'ORD-1749157528756-06BB2D6C', '23', 'Velvet Matte Lipstick Trio', 34.99, '/assets/images/Beauty/Velvet Matte Lipstick Trio.png', '', 1, 34.99, '2025-06-05 21:05:28'),
(4, 'ORD-1749535752514-B5358118', '32', 'Designer Building Blocks (Storage Included)', 69.99, '/assets/images/Toys and Games/designer-building-blocks.png', '', 1, 69.99, '2025-06-10 06:09:12'),
(5, 'ORD-1749536099470-98382CDB', '1', 'Wireless Noise Cancelling Headphones', 199.99, '/assets/images/Electronics/Wireless Noise Cancelling Headphones.jpg', 'Black', 5, 999.95, '2025-06-10 06:14:59'),
(6, 'ORD-1749594485661-D5500D51', '32', 'Designer Building Blocks (Storage Included)', 69.99, '/assets/images/Toys and Games/designer-building-blocks.png', '', 1, 69.99, '2025-06-10 22:28:05'),
(7, 'ORD-1750578485907-06590DD1', '232', 'Wireless Noise Cancelling Headphones', 199.99, '/assets/images/Electronics/Wireless Noise Cancelling Headphones.jpg', 'Black', 1, 199.99, '2025-06-22 07:48:05'),
(8, 'ORD-1750578485907-06590DD1', '12', 'Recycled Denim Jeans', 59.99, '/assets/images/Fashion/Recycled Denim Jeans.png', 'Dark Wash', 2, 119.98, '2025-06-22 07:48:05'),
(9, 'ORD-1750584757071-19674ED1', '9', 'Slim Fit Chino Pants', 39.99, '/assets/images/Fashion/Slim Fit Chino Pants.png', 'Navy', 1, 39.99, '2025-06-22 09:32:37'),
(10, 'ORD-1750594593192-563025C1', '236', 'Montessori Toddler Activity Set', 49.99, '/assets/images/Toys and Games/montessori-activity-set.png', '', 1, 49.99, '2025-06-22 12:16:33'),
(11, 'ORD-1750594696933-92847AC6', '7', 'Wireless Earbuds with Charging Case', 129.99, '/assets/images/Electronics/Black Wireless Earbuds with Charging Case.png', 'Black', 1, 129.99, '2025-06-22 12:18:17'),
(12, 'ORD-1750595310577-EEDB3C50', '9', 'Slim Fit Chino Pants', 39.99, '/assets/images/Fashion/Slim Fit Chino Pants.png', 'Navy', 1, 39.99, '2025-06-22 12:28:30'),
(13, 'ORD-1750595310577-EEDB3C50', '8', ' Organic Cotton T-Shirt', 29.99, '/assets/images/Fashion/Organic Cotton T-Shirt.jpg', 'White', 1, 29.99, '2025-06-22 12:28:30'),
(14, 'ORD-1750668785943-BB653C01', '6', 'Portable Power Bank 20000mAh', 39.99, '/assets/images/Electronics/Portable Power Bank.png', 'Black', 1, 39.99, '2025-06-23 08:53:05'),
(15, 'ORD-1750764681554-FC4140EB', '6', 'Portable Power Bank 20000mAh', 39.99, '/assets/images/Electronics/Portable Power Bank.png', '', 1, 39.99, '2025-06-24 11:31:21'),
(16, 'ORD-1750766114779-4F58037C', '289', 'Silk Hydration Serum', 49.99, '/assets/images/Beauty/Silk Hydration Serum.png', '', 1, 49.99, '2025-06-24 11:55:14'),
(17, 'ORD-1750766114779-4F58037C', '290', 'Portable Power Bank 20000mAh', 39.99, '/assets/images/Electronics/Portable Power Bank.png', '', 1, 39.99, '2025-06-24 11:55:14'),
(18, 'ORD-1750766114779-4F58037C', '27', 'Wooden Magnetic Tiles (102pc)', 59.99, '/assets/images/Toys and Games/wooden-magnetic-tiles.png', '', 1, 59.99, '2025-06-24 11:55:14'),
(19, 'ORD-1750774276200-3144C941', '17', 'Digital Kitchen Scale', 19.99, '/assets/images/Home_Kitchen/Digital Kitchen Scale.png', '', 1, 19.99, '2025-06-24 14:11:16'),
(20, 'ORD-1750774432013-FDF373C7', '16', 'Smart Air Fryer Oven', 149.99, '/assets/images/Home_Kitchen/Smart Air Fryer Oven.png', 'Silver', 2, 299.98, '2025-06-24 14:13:52'),
(21, 'ORD-1750786846633-BEFCD45F', '361', 'Bluetooth Portable Speaker', 59.99, '/assets/images/Electronics/Bluetooth Portable Speaker.png', 'Blue', 1, 59.99, '2025-06-24 17:40:46'),
(22, 'ORD-1750786846633-BEFCD45F', '362', 'Silk Hydration Serum', 49.99, '/assets/images/Beauty/Silk Hydration Serum.png', 'default', 1, 49.99, '2025-06-24 17:40:46'),
(23, 'ORD-1750786846633-BEFCD45F', '363', 'Wireless Earbuds with Charging Case', 129.99, '/assets/images/Electronics/Black Wireless Earbuds with Charging Case.png', 'Black', 1, 129.99, '2025-06-24 17:40:46'),
(24, 'ORD-1750787319248-60D67B5B', '2', 'Smart Fitness Tracker Watch', 89.99, '/assets/images/Electronics/Smart Fitness Tracker Watch.jpg', '', 1, 89.99, '2025-06-24 17:48:39'),
(25, 'ORD-1750787319248-60D67B5B', '6', 'Portable Power Bank 20000mAh', 39.99, '/assets/images/Electronics/Portable Power Bank.png', '', 1, 39.99, '2025-06-24 17:48:39');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`) VALUES
(2, 1, '320262b4c827ecc5c3a85cb17ed621ec85e3aea3fa461f568669e5324c575cc8', '2025-06-24 15:16:27');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `seller_id` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `reorder_level` int(11) NOT NULL DEFAULT 20,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `rating`, `image`, `category`, `seller_id`, `stock`, `reorder_level`, `created_at`, `updated_at`) VALUES
(1, 'Wireless Noise Cancelling Headphones', 199.99, 4.80, '/assets/images/Electronics/Wireless Noise Cancelling Headphones.jpg', 'Electronics', 2, 9, 10, '2025-04-30 19:00:00', '2025-06-24 16:22:48'),
(2, 'Smart Fitness Tracker Watch', 89.99, 4.50, '/assets/images/Electronics/Smart Fitness Tracker Watch.jpg', 'Electronics', 2, 19, 10, '2025-04-30 19:00:00', '2025-06-24 17:48:39'),
(3, 'Bluetooth Portable Speaker', 59.99, 4.60, '/assets/images/Electronics/Bluetooth Portable Speaker.png', 'Electronics', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(4, 'Premium Studio Headphones', 249.99, 4.90, '/assets/images/Electronics/Premium Black Studio Headphones.png', 'Electronics', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(5, 'Smart Home Security Camera', 74.99, 4.60, '/assets/images/Electronics/Smart Home Security Camera.png', 'Electronics', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(6, 'Portable Power Bank 20000mAh', 39.99, 4.30, '/assets/images/Electronics/Portable Power Bank.png', 'Electronics', 2, 17, 10, '2025-04-30 19:00:00', '2025-06-24 17:48:39'),
(7, 'Wireless Earbuds with Charging Case', 129.99, 4.50, '/assets/images/Electronics/Black Wireless Earbuds with Charging Case.png', 'Electronics', 2, 19, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(8, 'Organic Cotton T-Shirt', 29.99, 4.30, '/assets/images/Fashion/Organic Cotton T-Shirt.jpg', 'Fashion', 2, 19, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(9, 'Slim Fit Chino Pants', 39.99, 4.40, '/assets/images/Fashion/Slim Fit Chino Pants.png', 'Fashion', 2, 18, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(10, 'Leather Crossbody Bag', 49.99, 4.50, '/assets/images/Fashion/Leather Crossbody Bag.png', 'Fashion', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(11, 'Organic Cotton Hoodie', 49.99, 4.40, '/assets/images/Fashion/Organic Cotton Hoodie.png', 'Fashion', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(12, 'Recycled Denim Jeans', 59.99, 4.20, '/assets/images/Fashion/Recycled Denim Jeans.png', 'Fashion', 2, 18, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(13, 'Sustainable Canvas Tote Bag', 19.99, 4.50, '/assets/images/Fashion/Sustainable Canvas Tote Bag.png', 'Fashion', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(14, 'Minimalist Analog Wristwatch', 69.99, 4.60, '/assets/images/Fashion/Minimalist Analog Wristwatch.png', 'Fashion', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(15, 'Ceramic Non-Stick Cookware Set', 129.99, 4.80, '/assets/images/Home_Kitchen/Ceramic Non-Stick Cookware Set.png', 'Home & Kitchen', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(16, 'Smart Air Fryer Oven', 149.99, 4.70, '/assets/images/Home_Kitchen/Smart Air Fryer Oven.png', 'Home & Kitchen', 2, 18, 10, '2025-04-30 19:00:00', '2025-06-24 14:13:52'),
(17, 'Digital Kitchen Scale', 19.99, 4.50, '/assets/images/Home_Kitchen/Digital Kitchen Scale.png', 'Home & Kitchen', 2, 19, 10, '2025-04-30 19:00:00', '2025-06-24 14:11:16'),
(18, 'Glass Food Storage Containers - Set of 5', 34.99, 4.60, '/assets/images/Home_Kitchen/Glass Food Storage Containers.png', 'Home & Kitchen', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(19, 'Automatic Electric Kettle', 39.99, 4.70, '/assets/images/Home_Kitchen/Automatic Electric Kettle.png', 'Home & Kitchen', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(20, 'Stainless Steel Cooking Utensils Set', 49.99, 4.50, '/assets/images/Home_Kitchen/Stainless Steel Cooking Utensils Set.png', 'Home & Kitchen', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(21, 'Silk Hydration Serum', 49.99, 4.80, '/assets/images/Beauty/Silk Hydration Serum.png', 'Beauty', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(22, 'Luminous Weightless Foundation', 59.99, 4.70, '/assets/images/Beauty/Featherlight Luminous Foundation.png', 'Beauty', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(23, 'Velvet Matte Lipstick Trio', 34.99, 4.60, '/assets/images/Beauty/Velvet Matte Lipstick Trio.png', 'Beauty', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(24, 'Jade Roller & Gua Sha Set', 29.99, 4.90, '/assets/images/Beauty/jade-roller-set.png', 'Beauty', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(25, 'Botanical Perfume - White Jasmine', 79.99, 4.80, '/assets/images/Beauty/botanical-perfume.png', 'Beauty', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(26, 'Black Volume Mascara', 27.99, 4.50, '/assets/images/Beauty/volume-mascara.png', 'Beauty', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(27, 'Wooden Magnetic Tiles', 59.99, 4.90, '/assets/images/Toys and Games/wooden-magnetic-tiles.png', 'Toys & Games', 2, 19, 10, '2025-04-30 19:00:00', '2025-06-24 11:55:14'),
(28, 'Artisan Chess Set', 79.99, 4.80, '/assets/images/Toys and Games/artisan-chess-set.png', 'Toys & Games', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(29, 'Premium 3D Puzzle Globe', 39.99, 4.70, '/assets/images/Toys and Games/3d-puzzle-globe.png', 'Toys & Games', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(30, 'Montessori Toddler Activity Set', 49.99, 4.80, '/assets/images/Toys and Games/montessori-activity-set.png', 'Toys & Games', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(31, 'Vintage-Style Kaleidoscope', 29.99, 4.60, '/assets/images/Toys and Games/vintage-kaleidoscope.png', 'Toys & Games', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(32, 'Designer Building Blocks', 69.99, 4.70, '/assets/images/Toys and Games/designer-building-blocks.png', 'Toys & Games', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(33, 'Yoga Mat', 59.99, 4.90, '/assets/images/Sports/eco-yoga-mat.png', 'Sports', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(34, 'Adjustable Dumbbells', 199.99, 4.80, '/assets/images/Sports/smart-dumbbells.png', 'Sports', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(35, 'Running Shoes', 129.99, 4.90, '/assets/images/Sports/running-shoes-unisex.png', 'Sports', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(36, 'Smart Jump Rope', 39.99, 4.70, '/assets/images/Sports/smart-jump-rope.png', 'Sports', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(37, 'Insulated Water Bottle', 29.99, 4.60, '/assets/images/Sports/insulated-bottle.png', 'Sports', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(38, 'Training Gloves', 34.99, 4.70, '/assets/images/Sports/training-gloves.png', 'Sports', 2, 20, 10, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(48, 'Elim Board Game', 30.00, NULL, '/assets/images/Toys and Games/elim_board_game.png.png', 'Toys and Games', 2, 10, 4, '2025-04-30 19:00:00', '2025-06-19 19:00:00'),
(55, 'Man Purse Crossbody Leather', 70.00, NULL, '/assets/images/Fashion/mens_shoulder_bag.jpg.jpg', 'Fashion', 2, 10, 4, '2025-04-30 19:00:00', '2025-06-24 11:23:17');

-- --------------------------------------------------------

--
-- Table structure for table `product_details`
--

CREATE TABLE `product_details` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `rating` decimal(3,1) DEFAULT NULL,
  `review_count` int(11) DEFAULT 0,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `colors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_details`
--

INSERT INTO `product_details` (`id`, `name`, `description`, `price`, `rating`, `review_count`, `images`, `colors`, `features`, `specifications`, `created_at`, `updated_at`) VALUES
(1, 'Wireless Noise Cancelling Headphones', 'Experience premium sound quality with these wireless noise cancelling headphones. Perfect for music lovers and professionals who need to focus in noisy environments.', 199.99, 4.8, 256, '[\"/assets/images/Electronics/Wireless Noise Cancelling Headphones.jpg\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Wireless+Noise+Cancelling+Headphones+Angle+1\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Wireless+Noise+Cancelling+Headphones+Angle+2\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Wireless+Noise+Cancelling+Headphones+Details\"]', '[\"Black\",\"Silver\",\"Blue\"]', '[\"Active Noise Cancellation\",\"Up to 30 hours battery life\",\"High-Resolution Audio\",\"Comfortable over-ear design\",\"Built-in microphone for calls\",\"Bluetooth 5.0 connectivity\"]', '{\"Brand\":\"AudioTech\",\"Model\":\"AT-NC100\",\"Connectivity\":\"Bluetooth 5.0, 3.5mm audio jack\",\"Battery Life\":\"Up to 30 hours\",\"Charging Time\":\"3 hours\",\"Weight\":\"250g\",\"Warranty\":\"2 years\"}', '2025-05-18 08:24:46', '2025-06-13 02:59:32'),
(2, 'Smart Fitness Tracker Watch', 'Track your health and fitness goals with this advanced smart watch. Features activity tracking, heart rate monitoring, sleep analysis, and smartphone notifications.', 89.99, 4.5, 189, '[\"/assets/images/Electronics/Smart Fitness Tracker Watch.jpg\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Watch+Angle+1\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Watch+Angle+2\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Watch+Details\"]', '[\"Black\",\"White\",\"Green\"]', '[\"24/7 Heart Rate Monitoring\",\"Activity and Sleep Tracking\",\"Water Resistant up to 50m\",\"Customizable Watch Faces\",\"Up to 7 days battery life\",\"Smart Notifications\"]', '{\"Brand\":\"FitTech\",\"Model\":\"FT-W200\",\"Display\":\"1.3 inch AMOLED touchscreen\",\"Battery Life\":\"Up to 7 days\",\"Water Resistance\":\"50m\",\"Weight\":\"40g\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(3, 'Bluetooth Portable Speaker', 'Enjoy powerful sound on the go with this compact Bluetooth speaker. Waterproof and durable, it’s perfect for outdoor adventures.', 59.99, 4.6, 175, '[\"/assets/images/Electronics/Bluetooth Portable Speaker.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Speaker+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Speaker+Side\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Speaker+Top\"]', '[\"Blue\",\"Black\",\"Red\"]', '[\"IPX7 Waterproof\",\"10 hours battery life\",\"Deep bass audio\",\"Portable and lightweight\",\"Bluetooth 5.0\",\"Built-in microphone\"]', '{\"Brand\":\"SoundWave\",\"Model\":\"SW-P200\",\"Connectivity\":\"Bluetooth 5.0\",\"Battery Life\":\"10 hours\",\"Weight\":\"500g\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(4, 'Premium Studio Headphones', 'High-fidelity studio headphones designed for audiophiles and professionals. Exceptional sound clarity with durable build.', 249.99, 4.9, 300, '[\"/assets/images/Electronics/Premium Black Studio Headphones.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Headphones+Side\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Headphones+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Ear+Cushion\"]', '[\"Black\",\"Silver\"]', '[\"High-fidelity audio\",\"Detachable cable\",\"Comfortable ear cushions\",\"Foldable design\",\"Wide frequency range\",\"Studio-grade performance\"]', '{\"Brand\":\"AudioTech\",\"Model\":\"AT-S300\",\"Connectivity\":\"3.5mm audio jack, 6.3mm adapter\",\"Frequency Range\":\"10Hz-40kHz\",\"Weight\":\"300g\",\"Warranty\":\"2 years\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(5, 'Smart Home Security Camera', 'Keep your home safe with this smart security camera featuring 1080p HD video, night vision, and motion detection.', 74.99, 4.6, 220, '[\"/assets/images/Electronics/Smart Home Security Camera.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Camera+Angle+1\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Camera+Night+Vision\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Camera+Mount\"]', '[\"White\",\"Black\"]', '[\"1080p Full HD\",\"Night vision up to 30ft\",\"Motion detection alerts\",\"Two-way audio\",\"Wi-Fi connectivity\",\"Cloud and local storage options\"]', '{\"Brand\":\"SecureCam\",\"Model\":\"SC-1080\",\"Resolution\":\"1080p\",\"Night Vision\":\"30ft\",\"Storage\":\"Cloud or MicroSD up to 128GB\",\"Weight\":\"200g\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(6, 'Portable Power Bank 20000mAh', 'High-capacity power bank for charging multiple devices on the go. Fast charging with a sleek, compact design.', 39.99, 4.3, 160, '[\"/assets/images/Electronics/Portable Power Bank.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Power+Bank+Side\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Ports+Closeup\"]', '[\"Black\",\"Silver\"]', '[\"20000mAh capacity\",\"Fast charging USB-C\",\"Dual USB output\",\"LED battery indicator\",\"Compact and lightweight\",\"Overcharge protection\"]', '{\"Brand\":\"PowerPlus\",\"Model\":\"PP-20000\",\"Capacity\":\"20000mAh\",\"Ports\":\"2 USB-A, 1 USB-C\",\"Weight\":\"350g\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(7, 'Wireless Earbuds with Charging Case', 'True wireless earbuds with rich sound and long battery life. Perfect for workouts and daily commutes.', 129.99, 4.5, 200, '[\"/assets/images/Electronics/Black Wireless Earbuds with Charging Case.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Earbuds+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Charging+Case\"]', '[\"Black\",\"White\"]', '[\"True wireless stereo\",\"Up to 24 hours total battery life\",\"IPX5 sweat resistance\",\"Touch controls\",\"Bluetooth 5.0\",\"Fast charging case\"]', '{\"Brand\":\"SoundWave\",\"Model\":\"SW-EB100\",\"Battery Life\":\"6 hours (earbuds), 24 hours (case)\",\"Charging Time\":\"1.5 hours\",\"Weight\":\"50g\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(8, ' Organic Cotton T-Shirt', 'Soft and breathable organic cotton t-shirt, perfect for casual wear and eco-conscious shoppers.', 29.99, 4.3, 150, '[\"/assets/images/Fashion/Organic Cotton T-Shirt.jpg\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=T-Shirt+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=T-Shirt+Back\"]', '[\"White\",\"Grey\",\"Navy\"]', '[\"100% organic cotton\",\"Breathable and lightweight\",\"Pre-shrunk fabric\",\"Eco-friendly dyes\",\"Soft and comfortable\",\"Machine washable\"]', '{\"Brand\":\"GreenThread\",\"Material\":\"Organic Cotton\",\"Fit\":\"Regular\",\"Sizes\":\"S-XXL\",\"Care\":\"Machine wash\",\"Warranty\":\"6 months\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(9, 'Slim Fit Chino Pants', 'Versatile slim fit chinos with a modern cut, ideal for both casual and professional settings.', 39.99, 4.4, 120, '[\"/assets/images/Fashion/Slim Fit Chino Pants.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Chinos+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Chinos+Side\"]', '[\"Navy\",\"Khaki\",\"Black\"]', '[\"Slim fit design\",\"Stretch fabric for comfort\",\"Durable stitching\",\"Classic 4-pocket style\",\"Machine washable\",\"Wrinkle-resistant\"]', '{\"Brand\":\"StyleFit\",\"Material\":\"98% Cotton, 2% Spandex\",\"Fit\":\"Slim\",\"Sizes\":\"28-38\",\"Care\":\"Machine wash\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(10, 'Leather Crossbody Bag', 'Stylish and functional leather crossbody bag with adjustable strap, perfect for daily essentials.', 49.99, 4.5, 180, '[\"/assets/images/Fashion/Leather Crossbody Bag.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Bag+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Bag+Interior\"]', '[\"Tan\",\"Black\",\"Brown\"]', '[\"Genuine leather\",\"Adjustable strap\",\"Multiple compartments\",\"Magnetic closure\",\"Lightweight design\",\"Durable lining\"]', '{\"Brand\":\"UrbanChic\",\"Material\":\"Genuine Leather\",\"Size\":\"10 x 7 x 3 inches\",\"Strap Length\":\"Adjustable up to 50 inches\",\"Weight\":\"400g\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(11, 'Organic Cotton Hoodie', 'Cozy and sustainable organic cotton hoodie with a relaxed fit, perfect for lounging or casual outings.', 49.99, 4.4, 110, '[\"/assets/images/Fashion/Organic Cotton Hoodie.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Hoodie+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Hoodie+Drawstrings\"]', '[\"Grey\",\"Navy\",\"Black\"]', '[\"100% organic cotton\",\"Kangaroo pocket\",\"Ribbed cuffs and hem\",\"Eco-friendly dyes\",\"Soft fleece lining\",\"Machine washable\"]', '{\"Brand\":\"GreenThread\",\"Material\":\"Organic Cotton\",\"Fit\":\"Relaxed\",\"Sizes\":\"S-XXL\",\"Care\":\"Machine wash\",\"Warranty\":\"6 months\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(12, 'Recycled Denim Jeans', 'Look great and feel good in these sustainable jeans made from recycled materials. Classic fit with modern eco-conscious style.', 59.99, 4.2, 92, '[\"/assets/images/Fashion/Recycled Denim Jeans.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Jeans+Front\"]', '[\"Blue\",\"Dark Wash\"]', '[\"Made from recycled denim\",\"Classic 5-pocket design\",\"Straight fit\",\"Durable stitching\",\"Machine washable\"]', '{\"Brand\":\"GreenThread\",\"Material\":\"Recycled Cotton Blend\",\"Fit\":\"Straight\",\"Sizes\":\"28 to 40\",\"Care\":\"Machine wash cold\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(13, 'Sustainable Canvas Tote Bag', 'A lightweight, durable tote bag made from sustainable canvas. Ideal for groceries, books, and everyday carry.', 19.99, 4.5, 78, '[\"/assets/images/Fashion/Sustainable Canvas Tote Bag.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Tote+Front\"]', '[\"Natural\",\"Black\"]', '[\"Eco-friendly canvas\",\"Spacious interior\",\"Durable stitching\",\"Reusable and washable\",\"Comfortable handles\"]', '{\"Brand\":\"EarthTote\",\"Material\":\"Recycled Canvas\",\"Size\":\"15 x 16 inches\",\"Strap\":\"Dual handles\",\"Warranty\":\"6 months\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(14, 'Minimalist Analog Wristwatch', 'A sleek and timeless analog wristwatch with minimalist design. Built with precision and durability in mind.', 69.99, 4.6, 145, '[\"/assets/images/Fashion/Minimalist Analog Wristwatch.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Watch+Side\"]', '[\"Silver\",\"Black\"]', '[\"Minimalist analog display\",\"Stainless steel case\",\"Water-resistant up to 30m\",\"Leather strap\",\"Quartz movement\"]', '{\"Brand\":\"TimeCore\",\"Material\":\"Stainless Steel & Leather\",\"Display\":\"Analog\",\"Warranty\":\"2 years\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(15, 'Ceramic Non-Stick Cookware Set', 'This 10-piece ceramic non-stick cookware set is perfect for easy cooking and cleaning...', 129.99, 4.8, 120, '[\"/assets/images/Home_Kitchen/Ceramic Non-Stick Cookware Set.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Cookware+Set\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Pan+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Pot+Detail\"]', '[\"Red\",\"Blue\",\"Black\"]', '[\"Ceramic non-stick coating\",\"Heat-resistant handles\",\"Dishwasher safe\",\"Oven safe up to 500°F\",\"Eco-friendly and PFOA-free\"]', '{\"Brand\":\"Kitchenware\",\"Model\":\"KWC-1010\",\"Material\":\"Ceramic\",\"Dishwasher Safe\":\"Yes\",\"Oven Safe\":\"Up to 500°F\",\"Weight\":\"4.5kg\",\"Warranty\":\"2 years\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(16, 'Smart Air Fryer Oven', 'Cook your favorite meals with less oil using this smart air fryer oven...', 149.99, 4.7, 200, '[\"/assets/images/Home_Kitchen/Smart Air Fryer Oven.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Air+Fryer+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Air+Fryer+Side\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Control+Panel\"]', '[\"Silver\",\"Black\"]', '[\"Air fry, bake, grill, and roast\",\"Smart cooking controls with app\",\"Easy to clean non-stick interior\",\"Large cooking capacity\",\"Preheat and timer settings\",\"Energy-efficient cooking\"]', '{\"Brand\":\"SmartCook\",\"Model\":\"SCO-2020\",\"Material\":\"Stainless Steel\",\"Cooking Capacity\":\"5L\",\"Dishwasher Safe\":\"Yes\",\"Weight\":\"6.2kg\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(17, 'Digital Kitchen Scale', 'This sleek digital kitchen scale allows for precise measurement...', 19.99, 4.5, 150, '[\"/assets/images/Home_Kitchen/Digital Kitchen Scale.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Scale+Top\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Scale+Display\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Scale+Side\"]', '[\"Silver\",\"Black\"]', '[\"High precision sensors\",\"LCD display\",\"Tare function\",\"Compact and portable\",\"Units in grams, ounces, and pounds\",\"Auto-off function\"]', '{\"Brand\":\"ScaleMaster\",\"Model\":\"SM-101\",\"Material\":\"Stainless Steel\",\"Max Capacity\":\"5kg\",\"Battery\":\"AAA\",\"Weight\":\"0.5kg\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(18, 'Glass Food Storage Containers - Set of 5', 'These versatile glass food storage containers are perfect for meal prep...', 34.99, 4.6, 130, '[\"/assets/images/Home_Kitchen/Glass Food Storage Containers.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Containers+Set\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Container+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Lid+Detail\"]', '[\"Clear\",\"Blue\",\"Green\"]', '[\"Airtight, leak-proof lids\",\"BPA-free glass\",\"Microwave, oven, and freezer safe\",\"Dishwasher safe\",\"Perfect for meal prep and storage\"]', '{\"Brand\":\"FreshKeep\",\"Model\":\"FK-5020\",\"Material\":\"Glass\",\"Dishwasher Safe\":\"Yes\",\"Microwave Safe\":\"Yes\",\"Freezer Safe\":\"Yes\",\"Weight\":\"1.5kg\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(19, 'Automatic Electric Kettle', 'Boil water quickly and safely with this automatic electric kettle...', 39.99, 4.7, 180, '[\"/assets/images/Home_Kitchen/Automatic Electric Kettle.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Kettle+Front\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Kettle+Top\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Base+Detail\"]', '[\"White\",\"Black\",\"Silver\"]', '[\"Auto shut-off feature\",\"Fast boiling time\",\"Stainless steel body\",\"Cordless design\",\"Boil-dry protection\",\"360-degree swivel base\"]', '{\"Brand\":\"KettleTech\",\"Model\":\"KT-500\",\"Material\":\"Stainless Steel\",\"Capacity\":\"1.7L\",\"Boil Time\":\"5 minutes\",\"Weight\":\"1.2kg\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(20, 'Stainless Steel Cooking Utensils Set', 'This 10-piece stainless steel cooking utensils set includes all the essential tools...', 49.99, 4.5, 100, '[\"/assets/images/Home_Kitchen/Stainless Steel Cooking Utensils Set.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Utensils+Set\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Spatula+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Ladle+Detail\"]', '[\"Silver\",\"Black\"]', '[\"Durable stainless steel\",\"Ergonomic, non-slip handles\",\"Dishwasher safe\",\"Heat-resistant\",\"Includes spatula, ladle, slotted spoon, and more\"]', '{\"Brand\":\"CookMaster\",\"Model\":\"CM-2020\",\"Material\":\"Stainless Steel\",\"Dishwasher Safe\":\"Yes\",\"Weight\":\"1.3kg\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(21, 'Silk Hydration Serum', 'A luxe serum infused with hyaluronic acid and silk extracts to deeply hydrate, plump, and illuminate skin. Ideal for achieving a dewy, glass-skin finish.', 49.99, 4.8, 210, '[\"/assets/images/Beauty/Silk Hydration Serum.png\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Silk+Hydration+Serum\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Serum+Closeup\"]', NULL, '[\"Instant 72-hour hydration\",\"Reduces fine lines & wrinkles\",\"Vegan & cruelty-free\",\"Weightless, non-greasy texture\"]', '{\"Brand\":\"LuxeGlow\",\"Size\":\"30ml\",\"Skin Type\":\"All, especially dry/mature\",\"Cruelty-Free\":\"Yes\",\"Weight\":\"0.15kg\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(22, 'Luminous Weightless Foundation', 'A buildable, radiant foundation with SPF 20 that blends seamlessly for a natural, skin-like finish. 12 flexible shades for all skin tones.', 59.99, 4.7, 185, '[\"/assets/images/Beauty/Featherlight Luminous Foundation.png\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Luminous+Foundation\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Foundation+Shades\"]', NULL, '[\"Lightweight, full-coverage\",\"SPF 20 protection\",\"Hydrating & non-cakey\",\"Vegan formula\"]', '{\"Brand\":\"LuxeGlow\",\"Size\":\"30ml\",\"Shade Range\":\"12 shades\",\"Cruelty-Free\":\"Yes\",\"Weight\":\"0.25kg\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(23, 'Velvet Matte Lipstick Trio', 'Three universally flattering matte lipsticks in nude rose, cocoa, and vintage red. Long-wearing, creamy, and enriched with shea butter.', 34.99, 4.6, 175, '[\"/assets/images/Beauty/Velvet Matte Lipstick Trio.png\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Lipstick+Trio\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Swatches\"]', NULL, '[\"Transfer-proof & smudge-resistant\",\"Creamy, non-drying formula\",\"Includes 3 cult-favorite shades\",\"Paraben-free\"]', '{\"Brand\":\"LuxeLips\",\"Size\":\"3 x 3.5g\",\"Shades\":\"Nude Rose, Cocoa, Vintage Red\",\"Cruelty-Free\":\"Yes\",\"Weight\":\"0.12kg\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(24, 'Jade Roller & Gua Sha Set', 'Handcrafted jade tools to depuff, contour, and boost circulation. The roller cools skin, while the gua sha sculpts for a lifted appearance.', 29.99, 4.9, 230, '[\"/assets/images/Beauty/jade-roller-set.png\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Jade+Set\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Tools+Closeup\"]', NULL, '[\"100% authentic jade stone\",\"Dual-ended roller for face/eyes\",\"Includes velvet storage pouch\",\"Eco-friendly packaging\"]', '{\"Brand\":\"PureJade\",\"Size\":\"Roller: 6cm, Gua Sha: 8cm\",\"Material\":\"Natural Jade\",\"Weight\":\"0.3kg\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(25, 'Botanical Perfume - White Jasmine', 'A delicate floral fragrance with jasmine, sandalwood, and vanilla notes. Alcohol-free and long-lasting for a subtle, elegant scent.', 79.99, 4.8, 195, '[\"/assets/images/Beauty/botanical-perfume.png\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=White+Jasmine\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Perfume+Bottle\"]', NULL, '[\"Alcohol-free & non-irritating\",\"6-8 hour wear time\",\"Unisex fragrance\",\"Vegan & cruelty-free\"]', '{\"Brand\":\"EssenceBotanica\",\"Size\":\"50ml\",\"Scent Notes\":\"Jasmine, Sandalwood, Vanilla\",\"Vegan\":\"Yes\",\"Weight\":\"0.35kg\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(26, 'Black Volume Mascara', 'A clump-free mascara that adds dramatic volume and length without smudging. Enriched with vitamin E to nourish lashes.', 27.99, 4.5, 165, '[\"/assets/images/Beauty/volume-mascara.png\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Volume+Mascara\",\"https://placehold.co/600x600/EEE/31343C?font=montserrat&text=Brush+Closeup\"]', NULL, '[\"Buildable, fiber-free formula\",\"Water-resistant (not waterproof)\",\"Nourishes with vitamin E\",\"Cruelty-free\"]', '{\"Brand\":\"LuxeLash\",\"Size\":\"10ml\",\"Color\":\"Jet Black\",\"Cruelty-Free\":\"Yes\",\"Weight\":\"0.1kg\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(27, 'Wooden Magnetic Tiles (102pc)', 'Premium birch wood magnetic tiles with food-grade finishes. Encourages STEM learning through creative architecture and geometric play for ages 3+.', 59.99, 4.9, 320, '[\"/assets/images/Toys and Games/wooden-magnetic-tiles.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Wooden+Tiles+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Structures+Example\"]', NULL, '[\"102 natural wood pieces with magnets\",\"Non-toxic, child-safe finishes\",\"Includes architectural idea cards\",\"Sturdy cotton storage bag included\",\"Develops spatial reasoning skills\"]', '{\"Brand\":\"TimberPlay\",\"Material\":\"Birch wood + neodymium magnets\",\"Recommended Age\":\"3-12 years\",\"Piece Count\":\"102\",\"Weight\":\"2.1kg\",\"Certifications\":\"ASTM F963, EN71\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(28, 'Artisan Chess Set', 'Handcrafted walnut and maple chess set with weighted pieces and leather-bound board. A timeless strategy game for ages 8+.', 79.99, 4.8, 210, '[\"/assets/images/Toys and Games/artisan-chess-set.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Chess+Pieces+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Board+Detail\"]', NULL, '[\"Solid wood pieces with felt bottoms\",\"Leather-bound folding board\",\"Includes beginner\'s strategy guide\",\"Weighted for tournament play\",\"Gift box packaging\"]', '{\"Brand\":\"RegalGames\",\"Material\":\"Walnut, maple, leather\",\"Board Size\":\"14\\\" x 14\\\" folded\",\"King Height\":\"3.5\\\"\",\"Weight\":\"1.8kg\",\"Recommended Age\":\"8+\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(29, 'Premium 3D Puzzle Globe', 'Educational 540-piece 3D puzzle globe with metallic country accents. Perfect for geography lovers aged 10+.', 39.99, 4.7, 180, '[\"/assets/images/Toys and Games/3d-puzzle-globe.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Puzzle+Details\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Completed+Globe\"]', NULL, '[\"540 precision-cut cardboard pieces\",\"Gold-foiled country borders\",\"Includes display stand & guide\",\"No glue required\",\"LED base available separately\"]', '{\"Brand\":\"GeoMaster\",\"Material\":\"Recycled cardboard\",\"Diameter\":\"10\\\" assembled\",\"Piece Count\":\"540\",\"Weight\":\"0.9kg\",\"Recommended Age\":\"10+\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(30, 'Montessori Toddler Activity Set', 'Complete wooden activity set with shape sorting, stacking, and counting tools for early childhood development (18mo+).', 49.99, 4.8, 240, '[\"/assets/images/Toys and Games/montessori-activity-set.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Activity+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Full+Set\"]', NULL, '[\"12 developmental activities\",\"Solid beech wood construction\",\"Non-toxic water-based paints\",\"Includes cotton storage tray\",\"Meets Montessori standards\"]', '{\"Brand\":\"LittleExplorer\",\"Material\":\"Beech wood\",\"Piece Count\":\"48\",\"Recommended Age\":\"18mo-4yrs\",\"Weight\":\"1.4kg\",\"Certifications\":\"CPSC, ASTM\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(31, 'Vintage-Style Kaleidoscope', 'Handcrafted brass kaleidoscope with interchangeable image wheels. A timeless optical toy for ages 5+.', 29.99, 4.6, 150, '[\"/assets/images/Toys and Games/vintage-kaleidoscope.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Kaleidoscope+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Pattern+Examples\"]', NULL, '[\"Solid brass body with floral etchings\",\"3 interchangeable pattern wheels\",\"Crystal-clear optical system\",\"Gift box with velvet lining\",\"Made in Germany\"]', '{\"Brand\":\"Optica\",\"Material\":\"Brass, optical glass\",\"Length\":\"8\\\"\",\"Weight\":\"0.4kg\",\"Recommended Age\":\"5+\",\"Warranty\":\"Lifetime mechanical\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(32, 'Designer Building Blocks (Storage Included)', 'Modern architectural building block set with storage tray. 216 premium pieces for creative construction (ages 4+).', 69.99, 4.7, 190, '[\"/assets/images/Toys and Games/designer-building-blocks.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Blocks+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Creative+Builds\"]', NULL, '[\"216 precision-molded pieces\",\"Includes 6 architectural guide cards\",\"Natural wood storage tray\",\"BPA-free ABS plastic\",\"Interconnects with major brands\"]', '{\"Brand\":\"ArchiKids\",\"Material\":\"ABS plastic\",\"Piece Count\":\"216\",\"Storage Tray Size\":\"12\\\" x 9\\\"\",\"Weight\":\"1.6kg\",\"Recommended Age\":\"4-12\"}', '2025-05-18 08:24:46', '2025-05-18 08:24:46'),
(33, 'Eco-Friendly Yoga Mat (6mm)', 'Non-toxic natural rubber yoga mat with alignment markers. Ultra-grip surface for all practice types, biodegradable packaging included.', 59.99, 4.9, 280, '[\"/assets/images/Sports/eco-yoga-mat.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Mat+Texture+Closeup\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Rolled+Mat\"]', NULL, '[\"100% natural rubber material\",\"Alignment markers for poses\",\"6mm thickness for joint support\",\"Includes carrying strap\",\"Eco-conscious manufacturing\"]', '{\"Brand\":\"PureFlow\",\"Material\":\"Natural rubber\",\"Thickness\":\"6mm\",\"Size\":\"72\\\" x 24\\\"\",\"Weight\":\"2.3kg\",\"Certifications\":\"OEKO-TEX Standard 100\"}', '2025-05-18 08:24:47', '2025-05-18 08:24:47'),
(34, 'Smart Adjustable Dumbbells (5-25kg)', 'Space-saving adjustable dumbbell system with digital weight display. Seamless transitions between 5-25kg in 2.5kg increments.', 199.99, 4.8, 320, '[\"/assets/images/Sports/smart-dumbbells.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Weight+Adjustment\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Digital+Display\"]', NULL, '[\"5-25kg range (2.5kg increments)\",\"Bluetooth sync with fitness apps\",\"Ergonomic contoured handles\",\"Compact stand included\",\"Durable steel construction\"]', '{\"Brand\":\"IronTech\",\"Material\":\"Steel/composite\",\"WeightRange\":\"5-25kg\",\"Adjustment Time\":\"<5 seconds\",\"Warranty\":\"3 years\",\"AppCompatibility\":\"iOS/Android\"}', '2025-05-18 08:24:47', '2025-05-18 08:24:47'),
(35, 'Performance Running Shoes (Unisex)', 'Lightweight carbon-neutral running shoes with responsive cushioning. Engineered mesh upper for breathability, ideal for road/trail running.', 129.99, 4.9, 410, '[\"/assets/images/Sports/running-shoes-unisex.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Sole+Detail\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Side+Profile\"]', NULL, '[\"Energy-return midsole technology\",\"Recycled polyester engineered mesh\",\"Carbon neutral manufacturing\",\"Wet/dry traction outsole\",\"Reflective safety details\"]', '{\"Brand\":\"TerraRun\",\"Weight\":\"255g (size 9)\",\"Drop\":\"8mm\",\"Sizes\":\"US 5-13\",\"Colors\":\"3 options\",\"Sustainability\":\"50% recycled materials\"}', '2025-05-18 08:24:47', '2025-05-18 08:24:47'),
(36, 'Smart Jump Rope with App Sync', 'Bluetooth-enabled jump rope with real-time calorie tracking. Adjustable cable length and weighted handles for customizable workouts.', 39.99, 4.7, 190, '[\"/assets/images/Sports/smart-jump-rope.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Handle+Detail\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=App+Interface\"]', NULL, '[\"Tracks jumps, calories & time\",\"Adjustable 7.5-9ft cable\",\"100g weighted handles\",\"30-day battery life\",\"Includes travel pouch\"]', '{\"Brand\":\"CardioSync\",\"Material\":\"Steel cable/PVC\",\"Handle Weight\":\"100g each\",\"Connectivity\":\"Bluetooth 5.0\",\"Compatibility\":\"iOS/Android\",\"Warranty\":\"1 year\"}', '2025-05-18 08:24:47', '2025-05-18 08:24:47'),
(37, 'Insulated Stainless Steel Water Bottle (750ml)', 'Double-walled vacuum insulated bottle with leak-proof lid. Keeps liquids cold 24hr/hot 12hr, with ergonomic carry handle.', 29.99, 4.6, 370, '[\"/assets/images/Sports/insulated-bottle.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Lid+Mechanism\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Color+Options\"]', NULL, '[\"18/8 stainless steel construction\",\"Sweat-proof exterior\",\"One-handed flip-top lid\",\"BPA-free materials\",\"Fits most cup holders\"]', '{\"Brand\":\"HydroPeak\",\"Capacity\":\"750ml\",\"Insulation\":\"Double-wall vacuum\",\"Cold Retention\":\"24 hours\",\"Hot Retention\":\"12 hours\",\"Colors\":\"5 options\"}', '2025-05-18 08:24:47', '2025-05-18 08:24:47'),
(38, 'Ventilated Training Gloves with Wrist Wrap', 'Breathable weightlifting gloves with adjustable wrist support. Premium leather palms and touchscreen-compatible fingertips.', 34.99, 4.7, 240, '[\"/assets/images/Sports/training-gloves.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Wrist+Support\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Palm+Detail\"]', NULL, '[\"3D mesh ventilation panels\",\"1.8mm premium goatskin palms\",\"Adjustable hook-and-loop straps\",\"Touchscreen fingertips\",\"Sizes XS-XL\"]', '{\"Brand\":\"GripMaster\",\"Material\":\"Goatskin/mesh\",\"Wrist Support\":\"Adjustable strap\",\"Sizes\":\"XS-XL\",\"Colors\":\"Black/Blue/Pink\",\"Warranty\":\"6 months\"}', '2025-05-18 08:24:47', '2025-05-18 08:24:47'),
(48, 'Elim Board Game', 'Embark on an epic maritime adventure with Elim, a strategic board game that combines exploration, resource management, and tactical combat. Navigate treacherous waters, build settlements on mysterious islands, and command fleets of ships in this beautifully crafted game featuring high-quality wooden components. Players compete to control territories, gather resources, and achieve victory through careful planning and strategic positioning on a stunning illustrated game board', 30.00, 3.9, 0, '[\"/assets/images/Toys and Games/elim_board_game.png.png\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Elim+Board+Game+Angle+1\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Elim+Board+Game+Angle+2\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Elim+Board+Game+Details\"]', '[]', '[\"High-quality wooden game pieces and components\",\"Beautiful illustrated game board with nautical theme\",\"Strategic gameplay combining exploration and territory control\",\"Multiple ship and character miniatures included\"]', '{\"Player Count\":\"2-4 players\",\"Age Range\":\"12+ years\",\"Game Duration\":\" 60-90 minutes\"}', '2025-06-19 01:55:03', '2025-06-19 01:55:03'),
(55, 'Man Purse Crossbody Leather, Mens Shoulder Bag Leather Messenger Bag For Men', 'Neat and clear thread sewed by experienced worker.Waterproof faux leather,protect your important item from rain.It can also be carried for outdoor activities, such as running, cycling, camping, etc.', 70.00, 0.0, 0, '[\"/assets/images/Fashion/mens_shoulder_bag.jpg.jpg\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Man+Purse+Crossbody+Leather,+Mens+Shoulder+Bag+Leather+Messenger+Bag+For+Men+Angle+1\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Man+Purse+Crossbody+Leather,+Mens+Shoulder+Bag+Leather+Messenger+Bag+For+Men+Angle+2\",\"https://placehold.co/600x600/F5F5F5/555555?font=montserrat&text=Man+Purse+Crossbody+Leather,+Mens+Shoulder+Bag+Leather+Messenger+Bag+For+Men+Details\"]', '[\"black\",\"brown\",\"Maroon\"]', '[]', '{}', '2025-06-20 14:09:57', '2025-06-23 06:15:31');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`user_id`, `first_name`, `last_name`, `phone`, `country`) VALUES
(1, 'Amaeda', 'Qureshi', '03163525668', 'Other'),
(5, 'Amaeda', 'Q', '03163525668', 'Canada');

-- --------------------------------------------------------

--
-- Table structure for table `related_products`
--

CREATE TABLE `related_products` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `related_product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `related_products`
--

INSERT INTO `related_products` (`id`, `product_id`, `related_product_id`) VALUES
(4, 2, 6),
(6, 2, 7),
(5, 2, 34),
(7, 3, 1),
(9, 3, 6),
(8, 3, 7),
(10, 4, 1),
(11, 4, 3),
(12, 4, 7),
(13, 5, 2),
(15, 5, 3),
(14, 5, 6),
(17, 6, 2),
(16, 6, 3),
(18, 6, 7),
(19, 7, 1),
(20, 7, 4),
(21, 7, 6),
(22, 8, 11),
(23, 8, 12),
(24, 8, 13),
(25, 9, 8),
(26, 9, 12),
(27, 9, 14),
(30, 10, 8),
(28, 10, 13),
(29, 10, 14),
(31, 11, 8),
(33, 11, 9),
(32, 11, 12),
(34, 12, 8),
(35, 12, 9),
(36, 12, 11),
(38, 13, 8),
(37, 13, 10),
(39, 13, 14),
(40, 14, 9),
(41, 14, 10),
(42, 14, 13),
(43, 15, 16),
(44, 15, 17),
(45, 15, 18),
(46, 16, 15),
(47, 16, 17),
(48, 16, 19),
(50, 17, 15),
(49, 17, 16),
(51, 17, 18),
(52, 18, 15),
(53, 18, 16),
(54, 18, 19),
(56, 19, 15),
(55, 19, 16),
(57, 19, 18),
(58, 20, 15),
(59, 20, 16),
(60, 20, 17),
(61, 21, 22),
(62, 21, 24),
(63, 22, 21),
(64, 22, 26),
(66, 23, 24),
(65, 23, 25),
(67, 24, 21),
(68, 24, 25),
(69, 25, 23),
(70, 25, 24),
(71, 26, 22),
(72, 26, 23),
(74, 27, 30),
(73, 27, 32),
(75, 28, 29),
(76, 28, 31),
(78, 29, 27),
(77, 29, 28),
(79, 30, 27),
(80, 30, 31),
(81, 31, 28),
(82, 31, 32),
(83, 32, 27),
(84, 32, 30),
(85, 33, 37),
(86, 33, 38),
(88, 34, 36),
(87, 34, 38),
(89, 35, 36),
(90, 35, 37),
(92, 36, 34),
(91, 36, 35),
(93, 37, 33),
(94, 37, 35),
(95, 38, 34),
(96, 38, 36);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `user_name`, `rating`, `comment`, `created_at`) VALUES
(1, 14, 2147483647, 'Emily Roberts', 4, NULL, '2025-06-05 20:50:48'),
(2, 38, 2147483647, 'Emily Roberts', 4, NULL, '2025-06-22 14:03:32'),
(3, 6, 2147483647, 'Emily Roberts', 5, NULL, '2025-06-22 15:57:01');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sets`
--

CREATE TABLE `sets` (
  `name` varchar(256) NOT NULL,
  `member` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sorted_sets`
--

CREATE TABLE `sorted_sets` (
  `name` varchar(256) NOT NULL,
  `member` varchar(256) NOT NULL,
  `score` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','seller','admin') DEFAULT 'user',
  `account_type` enum('personal','business') NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` varchar(256) NOT NULL,
  `labels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `subscribe` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `comment` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `account_type`, `is_verified`, `created_at`, `user_id`, `labels`, `subscribe`, `comment`) VALUES
(1, 'amaedaqureshi@gmail.com', '$2b$12$R.x2u6tZzJWZscs8PZkewexwFn6l2WBvhCt1OYJvcjIr7KbTmKOm.', 'user', 'personal', 0, '2025-06-05 20:57:27', '543df437d0a05556568cb1a830d3d736', '[]', '{}', ''),
(2, 'urbanglimmer@gmail.com', '$2b$12$sgktYts9rSdzEXDMhlK93OJPy/JiuiM7MrtQPbr6yHEkipJhor192', 'seller', 'business', 0, '2025-06-05 21:16:27', '0f75c441d241f26dbb45b5c458f433e3', '[]', '{}', ''),
(3, 'Luminarynaive@gmail.com', '$2b$12$gecTKZdRptDUCR.tq31xkuHb2Wcqwl889YyjKv96UAJwsmv7ncveC', 'seller', 'business', 0, '2025-06-10 01:44:27', 'e0526be2df106b695cc0152ace603e31', '[]', '{}', ''),
(4, 'techinovatives@gmail.com', '$2b$12$gr3owzQLz9THOg6vjhjP5Oy4T86kRVymlGWqLGAt.eJ7Hv2s9ycki', 'seller', 'business', 0, '2025-06-13 14:58:43', '1638e0e767b8c3cb4849e6727618852d', '[]', '{}', ''),
(5, 'amaeda@gmail.com', '$2b$12$ZykZ45BHyBDlqsInB0xIRuEQZjhb7fmong7Bfdp1oLPh2gUSt2p7e', 'user', 'personal', 0, '2025-06-22 14:53:39', '1b33e71621f10ad101aaad3706c19037', '[]', '{}', '');

-- --------------------------------------------------------

--
-- Table structure for table `values`
--

CREATE TABLE `values` (
  `name` varchar(256) NOT NULL,
  `value` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `business_profiles`
--
ALTER TABLE `business_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`,`color`),
  ADD KEY `idx_cart_user_id` (`user_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_type`,`user_id`,`item_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `interactions`
--
ALTER TABLE `interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_event` (`user_id`,`event_type`),
  ADD KEY `idx_visitor_event` (`visitor_id`,`event_type`),
  ADD KEY `idx_item_event` (`item_id`,`event_type`),
  ADD KEY `idx_interactions` (`visitor_id`,`created_at`,`item_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_orders_user_id` (`user_id`),
  ADD KEY `idx_orders_status` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order_id` (`order_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_seller_id` (`seller_id`),
  ADD KEY `idx_products` (`id`,`category`);

--
-- Indexes for table `product_details`
--
ALTER TABLE `product_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `related_products`
--
ALTER TABLE `related_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_relation` (`product_id`,`related_product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `sets`
--
ALTER TABLE `sets`
  ADD PRIMARY KEY (`name`,`member`);

--
-- Indexes for table `sorted_sets`
--
ALTER TABLE `sorted_sets`
  ADD PRIMARY KEY (`name`,`member`),
  ADD KEY `name` (`name`,`score`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `values`
--
ALTER TABLE `values`
  ADD PRIMARY KEY (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=390;

--
-- AUTO_INCREMENT for table `interactions`
--
ALTER TABLE `interactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=433;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `related_products`
--
ALTER TABLE `related_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `business_profiles`
--
ALTER TABLE `business_profiles`
  ADD CONSTRAINT `business_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `interactions`
--
ALTER TABLE `interactions`
  ADD CONSTRAINT `interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `interactions_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_seller_id` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `related_products`
--
ALTER TABLE `related_products`
  ADD CONSTRAINT `related_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product_details` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
