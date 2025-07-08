const mysql = require("mysql2/promise");
require("dotenv").config(); // Load env vars

// Manually load config variables from .env
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create database schema
async function createSchema() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
    );
    console.log(`Database ${dbConfig.database} created or already exists`);
    await connection.query(`USE \`${dbConfig.database}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_details (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        rating DECIMAL(3, 1),
        review_count INT DEFAULT 0,
        images JSON,
        colors JSON,
        features JSON,
        specifications JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("product_details table ready");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS related_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        related_product_id INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES product_details(id) ON DELETE CASCADE,
        UNIQUE KEY unique_relation (product_id, related_product_id)
      )
    `);
    console.log("related_products table ready");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        rating DECIMAL(3, 1),
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("products table ready");
  } catch (error) {
    console.error("Error creating schema:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Seed data
async function seedDatabase(productDetails) {
  const pool = await mysql.createPool(dbConfig);

  try {
    const allRelatedProducts = new Map();

    Object.values(productDetails).forEach((product) => {
      if (product.relatedProducts) {
        product.relatedProducts.forEach((rp) =>
          allRelatedProducts.set(rp.id, rp)
        );
      }
    });

    console.log("Inserting main products...");
    for (const product of Object.values(productDetails)) {
      await pool.query(
        `INSERT INTO products (id, name, price, rating, image)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), rating=VALUES(rating), image=VALUES(image)`,
        [
          product.id,
          product.name,
          product.price,
          product.rating,
          Array.isArray(product.images) ? product.images[0] : null,
        ]
      );
    }

    console.log("Inserting related products...");
    for (const rp of allRelatedProducts.values()) {
      await pool.query(
        `INSERT INTO products (id, name, price, rating, image)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), rating=VALUES(rating), image=VALUES(image)`,
        [rp.id, rp.name, rp.price, rp.rating, rp.image]
      );
    }

    console.log("Inserting product_details...");
    for (const product of Object.values(productDetails)) {
      await pool.query(
        `INSERT INTO product_details (id, name, description, price, rating, review_count, images, colors, features, specifications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price),
         rating=VALUES(rating), review_count=VALUES(review_count), images=VALUES(images), colors=VALUES(colors),
         features=VALUES(features), specifications=VALUES(specifications)`,
        [
          product.id,
          product.name,
          product.description,
          product.price,
          product.rating,
          product.reviewCount || 0,
          JSON.stringify(product.images),
          JSON.stringify(product.colors),
          JSON.stringify(product.features),
          JSON.stringify(product.specifications),
        ]
      );

      if (product.relatedProducts?.length) {
        await pool.query(`DELETE FROM related_products WHERE product_id = ?`, [
          product.id,
        ]);
        for (const rp of product.relatedProducts) {
          await pool.query(
            `INSERT INTO related_products (product_id, related_product_id) VALUES (?, ?)`,
            [product.id, rp.id]
          );
        }
      }
    }

    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

module.exports = { createSchema, seedDatabase };
