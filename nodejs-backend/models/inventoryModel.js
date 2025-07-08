// const mysql = require("mysql2/promise");
// const { pool } = require("../config/db");

// const getInventory = async (seller_id) => {
//   const [rows] = await pool.query(
//     "SELECT id, name, category, stock, reorder_level FROM products WHERE seller_id = ?",
//     [seller_id]
//   );
//   return rows;
// };

// const updateStock = async (id, seller_id, stock) => {
//   const [result] = await pool.query(
//     "UPDATE products SET stock = ? WHERE id = ? AND seller_id = ?",
//     [stock, id, seller_id]
//   );
//   return result.affectedRows;
// };

// const updateReorderLevel = async (id, seller_id, reorderLevel) => {
//   const [result] = await pool.query(
//     "UPDATE products SET reorder_level = ? WHERE id = ? AND seller_id = ?",
//     [reorderLevel, id, seller_id]
//   );
//   return result.affectedRows;
// };

// module.exports = {
//   getInventory,
//   updateStock,
//   updateReorderLevel
// };
const mysql = require("mysql2/promise");
const { pool } = require("../config/db");

const getInventory = async (seller_id) => {
  const [rows] = await pool.query(
    "SELECT id, name, category, stock, price, rating, reorder_level FROM products WHERE seller_id = ?",
    [seller_id]
  );
  return rows;
};

const getInteractions = async (seller_id) => {
  const [rows] = await pool.query(
    `SELECT i.item_id, i.event_type, i.created_at
     FROM interactions i
     JOIN products p ON i.item_id = p.id
     WHERE p.seller_id = ?`,
    [seller_id]
  );
  return rows;
};

const getSales = async (seller_id) => {
  const [rows] = await pool.query(
    `SELECT oi.product_id, oi.quantity, oi.price, oi.created_at
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.order_id
     JOIN products p ON oi.product_id = p.id
     WHERE p.seller_id = ?`,
    [seller_id]
  );
  return rows;
};

const updateStock = async (id, seller_id, stock) => {
  const [result] = await pool.query(
    "UPDATE products SET stock = ? WHERE id = ? AND seller_id = ?",
    [stock, id, seller_id]
  );
  return result.affectedRows;
};

const updateReorderLevel = async (id, seller_id, reorderLevel) => {
  const [result] = await pool.query(
    "UPDATE products SET reorder_level = ? WHERE id = ? AND seller_id = ?",
    [reorderLevel, id, seller_id]
  );
  return result.affectedRows;
};

module.exports = {
  getInventory,
  getInteractions,
  getSales,
  updateStock,
  updateReorderLevel
};