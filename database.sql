-- Create database
CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  address VARCHAR(400) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'store_owner') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  address VARCHAR(400) NOT NULL,
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE KEY user_store_unique (user_id, store_id)
);

-- Insert admin user (password: Admin@123)
INSERT INTO users (name, email, address, password, role)
VALUES (
  'System Administrator Account for Store Rating Platform',
  'admin@storerating.com',
  '123 Admin Street, Admin City, Admin Country, 12345',
  '$2b$10$3euPcmQFCiblsZeEu5s7p.9wdgpt0ooAJMvEGfD1SOPpUgQS/2qJC',
  'admin'
);

-- Insert sample store owners
INSERT INTO users (name, email, address, password, role)
VALUES
  (
    'John Smith Store Owner Account for Electronics Store',
    'john@electronics.com',
    '456 Store Street, Store City, Store Country, 67890',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9wdgpt0ooAJMvEGfD1SOPpUgQS/2qJC',
    'store_owner'
  ),
  (
    'Jane Doe Store Owner Account for Fashion Boutique',
    'jane@fashion.com',
    '789 Boutique Avenue, Fashion City, Fashion Country, 13579',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9wdgpt0ooAJMvEGfD1SOPpUgQS/2qJC',
    'store_owner'
  );

-- Insert sample normal users
INSERT INTO users (name, email, address, password, role)
VALUES
  (
    'Alice Johnson Regular Customer Account for Store Rating',
    'alice@example.com',
    '101 User Road, User City, User Country, 24680',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9wdgpt0ooAJMvEGfD1SOPpUgQS/2qJC',
    'user'
  ),
  (
    'Bob Williams Regular Customer Account for Store Rating',
    'bob@example.com',
    '202 Customer Lane, Customer City, Customer Country, 97531',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9wdgpt0ooAJMvEGfD1SOPpUgQS/2qJC',
    'user'
  );

-- Insert sample stores
INSERT INTO stores (name, email, address, owner_id)
VALUES
  (
    'Electronics Emporium Store for Electronic Gadgets',
    'contact@electronics.com',
    '456 Store Street, Store City, Store Country, 67890',
    2
  ),
  (
    'Fashion Forward Boutique for Trendy Clothing',
    'contact@fashion.com',
    '789 Boutique Avenue, Fashion City, Fashion Country, 13579',
    3
  );

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating)
VALUES
  (4, 1, 4),
  (4, 2, 5),
  (5, 1, 3);