const { Client } = require("pg");
require("dotenv").config();

const SQL = `
-- DROP EXISTING TABLES TO RESET THE DATABASE CLEANLY
DROP TABLE IF EXISTS instruments CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS instruments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
  category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id INTEGER REFERENCES brands(id) ON DELETE RESTRICT
);

INSERT INTO categories (name, description) VALUES 
('Percussion', 'Drums, cymbals, cowbells, and auxiliary rhythm instruments'),
('Strings', 'Acoustic, electric, and bass guitars, plus orchestral strings'),
('Keyboards & Synths', 'Digital pianos, MIDI controllers, and synthesizers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO brands (name) VALUES 
('Yamaha'), ('Fender'), ('Pearl'), ('Roland'), ('Ibanez')
ON CONFLICT (name) DO NOTHING;

INSERT INTO instruments (name, description, price, stock_quantity, category_id, brand_id) VALUES
('Export EXX 5-Piece Drum Set', 'Complete acoustic drum kit with hardware and cymbals', 95000.00, 4, 1, 3),
('Player Stratocaster Electric Guitar', 'Classic design with three single-coil pickups', 85000.00, 7, 2, 2),
('SR300E 4-String Bass Guitar', 'Active electric bass with dual humbucking pickups', 45000.00, 5, 2, 5);
`;

async function main() {
  console.log("Seeding instruments database...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("Instruments database seeded successfully!");
}

main().catch((err) => console.error(err));