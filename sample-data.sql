-- Sample data for the e-commerce platform

-- Insert sample products into MySQL (Product Service)
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('iPhone 15 Pro', 'Latest iPhone with advanced camera system', 999.99, 50, 'Electronics', 'images/iphone.jpg'),
('MacBook Pro 16"', 'Powerful laptop for professionals', 2499.99, 25, 'Electronics', 'images/macbook.jpg'),
('AirPods Pro', 'Wireless earbuds with noise cancellation', 249.99, 100, 'Electronics', 'images/headphone.jpg'),
('Apple Watch Series 9', 'Smartwatch with health monitoring', 399.99, 75, 'Electronics', 'images/watch.jpg'),
('iPad Air', 'Tablet for work and entertainment', 599.99, 40, 'Electronics', 'images/tablet.jpg'),
('Canon EOS R5', 'Professional mirrorless camera', 3899.99, 15, 'Electronics', 'images/camera.jpg');

-- Insert sample users into PostgreSQL (Auth Service)
INSERT INTO users (username, email, password_hash) VALUES
('john_doe', 'john@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'), -- password: password123
('jane_smith', 'jane@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'), -- password: password123
('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'); -- password: password123
