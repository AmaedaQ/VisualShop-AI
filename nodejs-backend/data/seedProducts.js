const mysql = require("mysql2");
const mockProducts = require("./mockProducts");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // use your password
  database: "intellicart-db",
});

connection.connect();

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    rating DECIMAL(3, 2),
    image VARCHAR(500),
    category VARCHAR(100)
  )
`;

connection.query(createTableQuery, (err) => {
  if (err) {
    console.error("Table creation failed:", err);
    return;
  }

  mockProducts.forEach((product) => {
    const { name, price, rating, image, category } = product;
    const query = `INSERT INTO products (name, price, rating, image, category)
                   VALUES (?, ?, ?, ?, ?)`;
    connection.query(query, [name, price, rating, image, category], (err) => {
      if (err) console.error("Insert error:", err);
    });
  });

  connection.end(() => {
    console.log("Seeding complete ✅");
  });
});
