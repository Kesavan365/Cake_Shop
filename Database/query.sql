-- Create the database
CREATE DATABASE IF NOT EXISTS cake_shop;
USE cake_shop;

-- Table: admins
CREATE TABLE IF NOT EXISTS admins (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert example admin
INSERT INTO admins (username, password, created_at) 
VALUES 
('admin', '$2y$10$vFkjy4IXyQx3OXLBPdog9.Fe5NytfKw8PWjnL7z3fZZ0kjmnbLdJK', '2025-08-19 16:05:57');

-- Table: cake_orders
CREATE TABLE IF NOT EXISTS cake_orders (
  id INT(11) NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(100) NOT NULL,
  contact VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  delivery_date DATE DEFAULT NULL,
  cost INT(11) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  model_path VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

