// const { pool } = require("../config/db");

// const ProductDetail = {
//   getAll: async () => {
//     const [rows] = await pool.query("SELECT * FROM product_details");
//     return rows;
//   },

//   getById: async (id) => {
//     const [rows] = await pool.query(
//       "SELECT * FROM product_details WHERE id = ?",
//       [id]
//     );

//     if (rows.length === 0) return null;

//     const productDetail = rows[0];

//     const jsonFields = ["images", "colors", "features", "specifications"];
//     jsonFields.forEach((field) => {
//       if (productDetail[field]) {
//         try {
//           productDetail[field] = JSON.parse(productDetail[field]);
//         } catch (err) {
//           console.error(`Error parsing ${field}:`, err);
//           productDetail[field] = [];
//         }
//       }
//     });

//     const [relatedProducts] = await pool.query(
//       `SELECT rp.related_product_id as id, p.name, p.price, p.rating, p.image 
//        FROM related_products rp 
//        JOIN products p ON rp.related_product_id = p.id 
//        WHERE rp.product_id = ?`,
//       [id]
//     );

//     return { ...productDetail, relatedProducts };
//   },

//   create: async (productDetail) => {
//     const { id, relatedProducts = [], ...data } = productDetail;

//     const jsonFields = ["images", "colors", "features", "specifications"];
//     const preparedData = jsonFields.reduce(
//       (acc, field) => {
//         acc[field] = data[field] ? JSON.stringify(data[field]) : null;
//         return acc;
//       },
//       { ...data }
//     );

//     await pool.query(
//       `INSERT INTO product_details 
//        (id, name, description, price, rating, review_count, images, colors, features, specifications) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         id,
//         preparedData.name,
//         preparedData.description,
//         preparedData.price,
//         preparedData.rating,
//         preparedData.review_count,
//         preparedData.images,
//         preparedData.colors,
//         preparedData.features,
//         preparedData.specifications,
//       ]
//     );

//     if (relatedProducts.length > 0) {
//       const values = relatedProducts.map((rp) => [id, rp.id]);
//       await pool.query(
//         "INSERT INTO related_products (product_id, related_product_id) VALUES ?",
//         [values]
//       );
//     }

//     return { id, ...productDetail };
//   },

//   update: async (id, productDetail) => {
//     const { relatedProducts = [], ...data } = productDetail;

//     const jsonFields = ["images", "colors", "features", "specifications"];
//     const preparedData = jsonFields.reduce(
//       (acc, field) => {
//         acc[field] = data[field] ? JSON.stringify(data[field]) : null;
//         return acc;
//       },
//       { ...data }
//     );

//     await pool.query(
//       `UPDATE product_details SET 
//        name = ?, description = ?, price = ?, rating = ?, review_count = ?, 
//        images = ?, colors = ?, features = ?, specifications = ? 
//        WHERE id = ?`,
//       [
//         preparedData.name,
//         preparedData.description,
//         preparedData.price,
//         preparedData.rating,
//         preparedData.review_count,
//         preparedData.images,
//         preparedData.colors,
//         preparedData.features,
//         preparedData.specifications,
//         id,
//       ]
//     );

//     await pool.query("DELETE FROM related_products WHERE product_id = ?", [id]);

//     if (relatedProducts.length > 0) {
//       const values = relatedProducts.map((rp) => [id, rp.id]);
//       await pool.query(
//         "INSERT INTO related_products (product_id, related_product_id) VALUES ?",
//         [values]
//       );
//     }

//     return { id, ...productDetail };
//   },

//   delete: async (id) => {
//     await pool.query("DELETE FROM related_products WHERE product_id = ?", [id]);
//     const [result] = await pool.query(
//       "DELETE FROM product_details WHERE id = ?",
//       [id]
//     );
//     return result.affectedRows > 0;
//   },
// };

// module.exports = ProductDetail;


const { pool } = require("../config/db");

const ProductDetail = {
  getAll: async () => {
    const [rows] = await pool.query("SELECT * FROM product_details");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_details WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;

    const productDetail = rows[0];

    const jsonFields = ["images", "colors", "features", "specifications"];
    jsonFields.forEach((field) => {
      if (productDetail[field]) {
        try {
          productDetail[field] = JSON.parse(productDetail[field]);
        } catch (err) {
          console.error(`Error parsing ${field}:`, err);
          productDetail[field] = [];
        }
      }
    });

    const [relatedProducts] = await pool.query(
      `SELECT rp.related_product_id as id, p.name, p.price, p.rating, p.image 
       FROM related_products rp 
       JOIN products p ON rp.related_product_id = p.id 
       WHERE rp.product_id = ?`,
      [id]
    );

    return { ...productDetail, relatedProducts };
  },

  create: async (productDetail) => {
    const { id, relatedProducts = null, ...data } = productDetail;

    const jsonFields = ["images", "colors", "features", "specifications"];
    const preparedData = jsonFields.reduce(
      (acc, field) => {
        acc[field] = data[field] ? JSON.stringify(data[field]) : null;
        return acc;
      },
      { ...data }
    );

    await pool.query(
      `INSERT INTO product_details 
       (id, name, description, price, rating, review_count, images, colors, features, specifications) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        preparedData.name,
        preparedData.description,
        preparedData.price,
        preparedData.rating || 0,
        preparedData.review_count || 0,
        preparedData.images,
        preparedData.colors,
        preparedData.features,
        preparedData.specifications,
      ]
    );

    if (relatedProducts && Array.isArray(relatedProducts) && relatedProducts.length > 0) {
      const values = relatedProducts.map((rp) => [id, rp.id]);
      await pool.query(
        "INSERT INTO related_products (product_id, related_product_id) VALUES ?",
        [values]
      );
    }

    return { id, ...productDetail };
  },

  update: async (id, productDetail) => {
    const { relatedProducts = null, ...data } = productDetail;

    const jsonFields = ["images", "colors", "features", "specifications"];
    const preparedData = jsonFields.reduce(
      (acc, field) => {
        acc[field] = data[field] ? JSON.stringify(data[field]) : null;
        return acc;
      },
      { ...data }
    );

    await pool.query(
      `UPDATE product_details SET 
       name = ?, description = ?, price = ?, rating = ?, review_count = ?, 
       images = ?, colors = ?, features = ?, specifications = ? 
       WHERE id = ?`,
      [
        preparedData.name,
        preparedData.description,
        preparedData.price,
        preparedData.rating || 0,
        preparedData.review_count || 0,
        preparedData.images,
        preparedData.colors,
        preparedData.features,
        preparedData.specifications,
        id,
      ]
    );

    await pool.query("DELETE FROM related_products WHERE product_id = ?", [id]);

    if (relatedProducts && Array.isArray(relatedProducts) && relatedProducts.length > 0) {
      const values = relatedProducts.map((rp) => [id, rp.id]);
      await pool.query(
        "INSERT INTO related_products (product_id, related_product_id) VALUES ?",
        [values]
      );
    }

    return { id, ...productDetail };
  },

  delete: async (id) => {
    await pool.query("DELETE FROM related_products WHERE product_id = ?", [id]);
    const [result] = await pool.query(
      "DELETE FROM product_details WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = ProductDetail;