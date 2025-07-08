// models/productModel.js
const mysql = require("mysql2/promise");
const { pool } = require("../config/db");

const getAllProducts = async () => {
  const [rows] = await pool.query("SELECT * FROM products");
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
};

const getProductsBySeller = async (seller_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM products WHERE seller_id = ?",
    [seller_id]
  );
  return rows;
};

const countProductsBySeller = async (seller_id) => {
  const [result] = await pool.query(
    "SELECT COUNT(*) as count FROM products WHERE seller_id = ?",
    [seller_id]
  );
  return result;
};

const addProduct = async (productData) => {
  const {
    name,
    price,
    category,
    image,
    seller_id,
    stock,
    reorderLevel
  } = productData;
  const [result] = await pool.query(
    "INSERT INTO products (name, price, category, image, seller_id, stock, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, price, category, image, seller_id, stock, reorderLevel || 20]
  );
  return result.insertId;
};

const updateProduct = async (id, productData) => {
  const { name, price, category, stock, reorderLevel, seller_id } = productData;
  const [result] = await pool.query(
    "UPDATE products SET name = ?, price = ?, category = ?, stock = ?, reorder_level = ? WHERE id = ? AND seller_id = ?",
    [name, price, category, stock, reorderLevel || 20, id, seller_id]
  );
  return result.affectedRows;
};

const deleteProduct = async (id, seller_id) => {
  // Delete from product_details first to maintain referential integrity
  await pool.query("DELETE FROM product_details WHERE id = ?", [id]);
  await pool.query("DELETE FROM related_products WHERE product_id = ? OR related_product_id = ?", [id, id]);
  const [result] = await pool.query(
    "DELETE FROM products WHERE id = ? AND seller_id = ?",
    [id, seller_id]
  );
  return result.affectedRows;
};

const searchProducts = async (query) => {
  const [rows] = await pool.query(
    "SELECT id, name, price, rating, image FROM products WHERE name LIKE ? LIMIT 10",
    [`%${query}%`]
  );
  return rows;
};

module.exports = {
  getAllProducts,
  getById,
  getProductsBySeller,
  countProductsBySeller,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts
};