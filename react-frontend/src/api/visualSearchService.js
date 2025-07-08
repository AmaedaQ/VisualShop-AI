class VisualSearchService {
  constructor() {
    this.FLASK_API = "http://localhost:8000/search";
    this.PRODUCTS_API = "http://localhost:5000/api/products";
    this.cachedProducts = null;
  }

  async fetchAllProducts() {
    if (this.cachedProducts) return this.cachedProducts;

    try {
      const response = await fetch(this.PRODUCTS_API);
      if (!response.ok) throw new Error("Failed to fetch products");
      const products = await response.json();
      this.cachedProducts = products;
      return products;
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      return [];
    }
  }

  async findSimilarProducts(uploadedFile) {
    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);

      const response = await fetch(this.FLASK_API, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        console.warn("⚠️ Flask API error:", errData.error || "Unknown error");
        return { topMatches: [], allMatches: [], totalResults: 0 };
      }

      const { results } = await response.json();
      if (!results || results.length === 0) {
        console.log("❌ No results from visual search.");
        return { topMatches: [], allMatches: [], totalResults: 0 };
      }

      const allProducts = await this.fetchAllProducts();

      const normalizedResults = results.map((result) => ({
        ...result,
        normalizedPath: this.normalizePath(result.image),
      }));

      const normalizedProducts = allProducts.map((product) => ({
        ...product,
        normalizedPath: this.normalizePath(product.image),
      }));

      const matchedProducts = [];

      for (const result of normalizedResults) {
        let matchedProduct = normalizedProducts.find((product) =>
          this.pathsMatch(product.normalizedPath, result.normalizedPath)
        );

        if (!matchedProduct) {
          matchedProduct = normalizedProducts.find((product) =>
            this.isLooselySimilar(product.name, result.normalizedPath)
          );
        }

        if (!matchedProduct) {
          matchedProduct = normalizedProducts.find((product) =>
            result.normalizedPath.includes(product.category.toLowerCase().replace(/\s+/g, "-"))
          );
        }

        if (matchedProduct) {
          const relatedProducts = normalizedProducts.filter(
            (p) => p.name === matchedProduct.name
          );

          for (const related of relatedProducts) {
            matchedProducts.push({
              ...related,
              similarity: result.similarity, // Use the percentage directly from API
              originalScore: result.score,
              category: result.category, // Add category from API
            });
          }
        } else {
          console.warn("⚠️ No product match found for:", result.image);
        }
      }

      // De-duplicate by product ID
      const uniqueProducts = Object.values(
        matchedProducts.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {})
      );

      // Sort by similarity in descending order (100, 99, 98, etc.)
      const sortedProducts = uniqueProducts.sort((a, b) => b.similarity - a.similarity);

      // Get top 4 products as topMatches
      const topMatches = sortedProducts.slice(0, 4);
      
      // All products for viewing when user clicks "View More"
      const allMatches = sortedProducts;

      return {
        topMatches,
        allMatches,
        totalResults: sortedProducts.length,
      };
    } catch (err) {
      console.error("❌ Visual search failed:", err);
      return { topMatches: [], allMatches: [], totalResults: 0 };
    }
  }

  normalizePath(path) {
    if (!path) return "";
    let normalized = path.toLowerCase();
    normalized = normalized.replace(/^\/?(assets\/|\/assets\/)/, "/assets/");
    normalized = normalized.replace(/\\/g, "/");
    normalized = normalized.replace(/\/+/g, "/");
    return normalized;
  }

  pathsMatch(path1, path2) {
    if (path1 === path2) return true;
    const getFilename = (path) => path.split("/").pop();
    return getFilename(path1) === getFilename(path2);
  }

  isLooselySimilar(productName, resultImagePath) {
    if (!productName || !resultImagePath) return false;
    const nameWords = productName.toLowerCase().split(/\s+/);
    const imageFileName = resultImagePath.split("/").pop().toLowerCase();
    return nameWords.some((word) => imageFileName.includes(word));
  }
}

const visualSearchService = new VisualSearchService();
export default visualSearchService;