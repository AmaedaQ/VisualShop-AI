const db = require('../config/db');

const ONE_HOUR_MS = 60 * 60 * 1000;

// Helper to get product categories by item IDs
async function getProductCategories(itemIds) {
  if (itemIds.length === 0) return [];

  const placeholders = itemIds.map(() => '?').join(',');
  console.log('Executing SQL:', `SELECT DISTINCT category FROM products WHERE id IN (${placeholders})`);
  const [rows] = await db.pool.execute(
    `SELECT DISTINCT category FROM products WHERE id IN (${placeholders})`,
    itemIds
  );
  console.log('SQL Response:', rows);
  return rows.map(r => r.category);
}

// Main recommendation logic
async function getRecommendationsForUser(userId, visitorId, wishlistProductIds = []) {
  try {
    // 1. Fetch last 100 interactions for user or visitor
    const [interactions] = await db.pool.execute(
      `SELECT item_id FROM interactions 
       WHERE (user_id = ? OR visitor_id = ?)
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId, visitorId]
    );

    // Extract item IDs from interactions
    const interactedItemIds = interactions.map(i => i.item_id);

    // 2. Get categories from interacted products
    const categories = await getProductCategories(interactedItemIds);

    // Count categories frequency
    const categoryCount = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Sort categories by frequency desc
    const sortedCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // 3. Get top 5 products from top 2 categories (excluding already interacted)
    let recommendedProducts = [];
    if (sortedCategories.length > 0) {
      const topCategories = sortedCategories.slice(0, 2);

      for (const cat of topCategories) {
        const [products] = await db.pool.execute(
          `SELECT id, name, category FROM products 
           WHERE category = ? AND id NOT IN (${interactedItemIds.length ? interactedItemIds.map(() => '?').join(',') : '0'})
           LIMIT 5`,
          [cat, ...interactedItemIds]
        );
        recommendedProducts = recommendedProducts.concat(products);
        if (recommendedProducts.length >= 5) break;
      }
    }

    // 4. Add wishlist products (exclude duplicates)
    if (wishlistProductIds.length > 0) {
      const [wishlistProducts] = await db.pool.execute(
        `SELECT id, name, category FROM products WHERE id IN (${wishlistProductIds.map(() => '?').join(',')})`,
        wishlistProductIds
      );
      wishlistProducts.forEach(p => {
        if (!recommendedProducts.find(rp => rp.id === p.id)) {
          recommendedProducts.push(p);
        }
      });
    }

    // 5. Fill with random products if less than 10
    if (recommendedProducts.length < 10) {
      const excludeIds = [
        ...interactedItemIds,
        ...recommendedProducts.map(p => p.id)
      ];
      const placeholders = excludeIds.length ? excludeIds.map(() => '?').join(',') : '0';
      const [randomProducts] = await db.pool.execute(
        `SELECT id, name, category FROM products 
         WHERE id NOT IN (${placeholders}) 
         ORDER BY RAND() LIMIT ?`,
        [...excludeIds, 10 - recommendedProducts.length]
      );
      recommendedProducts = recommendedProducts.concat(randomProducts);
    }

    // Limit to 10 final recommendations
    return recommendedProducts.slice(0, 10);

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return []; // fallback empty list
  }
}

module.exports = {
  getRecommendationsForUser,
  ONE_HOUR_MS,
};
