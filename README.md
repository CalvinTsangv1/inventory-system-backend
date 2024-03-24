# inventory-system-backend

## MySQL Database Setup
```sql
CREATE DATABASE inventory_system;
USE inventory_system;
INSERT INTO products (name, description, category, unit, price, stockQuantity, currency)
VALUES ('Mussels', 'Fresh PEI blue mussels', 'MOLLUSK', 'lb', 8.99, 75, 'CAD');

INSERT INTO products (name, description, category, unit, price, stockQuantity, currency)
VALUES ('Nori', 'Premium sushi-grade seaweed sheets', 'SEAWEED', 'pack', 12.99, 30, 'CAD');

INSERT INTO products (name, description, category, unit, price, stockQuantity, currency)
VALUES ('Tuna', 'Sushi-grade ahi tuna steak', 'FISH', 'lb', 24.99, 40, 'CAD');

INSERT INTO products (name, description, category, unit, price, stockQuantity, currency)
VALUES ('Scallops', 'Fresh jumbo sea scallops', 'SHELLFISH', 'lb', 29.99, 25, 'CAD');

INSERT INTO products (name, description, category, unit, price, stockQuantity, currency)
VALUES ('Crab', 'Wild-caught Dungeness crab legs', 'CRUSTACEAN', 'lb', 34.99, 15, 'CAD');

INSERT INTO products (name, description, category, unit, price, stockQuantity, currency)
VALUES ('Squid', 'Tender calamari rings', 'MOLLUSK', 'lb', 10.99, 60, 'CAD');

INSERT INTO products (name, description, category, unit, price, stockQuantity, currency)
VALUES ('Sea Cucumber', 'Premium sea cucumber', 'SEAWEED', 'each', 39.99, 10, 'CAD');
```

## Project setup
```bash
npm install
```