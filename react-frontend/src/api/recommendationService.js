import axios from 'axios';
import { getVisitorId } from '../utils/visitor';

const API_BASE_URL = 'http://localhost:8001'; // Updated backend URL
const CACHE_KEY = 'cached_homepage_recommendations';
const CACHE_TIME_KEY = 'cached_homepage_recommendations_time';
const CACHE_TTL_MS = 1 * 60 * 1000; // 5 minutes cache for homepage recommendations

/**
 * Fetch homepage recommendations from backend
 * @param {boolean} useCache - Whether to use cached data if available
 * @returns {Promise<Object>} Homepage recommendations response
 */
export async function fetchHomepageRecommendations(useCache = true) {
  const visitorId = getVisitorId();

  // Check cache first if enabled
  if (useCache) {
    const cachedData = getCachedHomepageRecommendations();
    if (cachedData) {
      console.log('📦 Using cached homepage recommendations');
      return cachedData;
    }
  }

  try {
    console.log('🔄 Fetching homepage recommendations from backend...');
    const response = await axios.get(`${API_BASE_URL}/homepage-recommendations`, {
      params: {
        visitor_id: visitorId
      },
      headers: {
        'Content-Type': 'application/json',
        'x-visitor-id': visitorId
      },
      timeout: 10000 // 10 second timeout
    });

    const recommendationsData = response.data;
    
    // Validate response structure
    if (!recommendationsData || !recommendationsData.items) {
      console.warn('⚠️ Invalid recommendations response structure');
      return getDefaultRecommendations();
    }

    console.log(`✅ Fetched ${recommendationsData.items.length} recommendations (${recommendationsData.type})`);

    // Cache the successful response
    localStorage.setItem(CACHE_KEY, JSON.stringify(recommendationsData));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

    return recommendationsData;

  } catch (error) {
    console.error('❌ Failed to fetch homepage recommendations:', error.message);
    
    // Try to return cached data as fallback
    const cachedData = getCachedHomepageRecommendations(false); // ignore TTL for fallback
    if (cachedData) {
      console.log('🔄 Using expired cache as fallback');
      return cachedData;
    }

    // Return default/empty recommendations as last resort
    return getDefaultRecommendations();
  }
}

/**
 * Get cached homepage recommendations if available and not expired
 * @param {boolean} respectTTL - Whether to respect cache TTL
 * @returns {Object|null} Cached recommendations or null
 */
export function getCachedHomepageRecommendations(respectTTL = true) {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

    if (!cached || !cacheTime) {
      return null;
    }

    if (respectTTL) {
      const age = Date.now() - parseInt(cacheTime, 10);
      if (age > CACHE_TTL_MS) {
        console.log('🕐 Homepage recommendations cache expired');
        return null;
      }
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading cached recommendations:', error);
    return null;
  }
}

/**
 * Clear homepage recommendations cache
 */
export function clearHomepageRecommendationsCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
  console.log('🗑️ Homepage recommendations cache cleared');
}

/**
 * Fetch product-specific recommendations (for product detail pages)
 * @param {string|number} productId - The product ID to get recommendations for
 * @param {number} limit - Number of recommendations to fetch
 * @returns {Promise<Array>} Array of recommended products
 */
export async function fetchProductRecommendations(productId, limit = 5) {
  const visitorId = getVisitorId();

  try {
    console.log(`🔄 Fetching recommendations for product ${productId}...`);
    const response = await axios.get(`${API_BASE_URL}/product-recommendations`, {
      params: {
        product_id: productId,
        visitor_id: visitorId,
        limit: limit
      },
      headers: {
        'Content-Type': 'application/json',
        'x-visitor-id': visitorId
      },
      timeout: 8000
    });

    return response.data.recommendations || [];

  } catch (error) {
    console.error(`❌ Failed to fetch product recommendations for ${productId}:`, error.message);
    return [];
  }
}

/**
 * Track user interaction for better recommendations
 * @param {string|number} itemId - Product ID
 * @param {string} eventType - Type of interaction (view, add_to_cart, order)
 * @param {Object} additionalData - Any additional data to track
 */
export async function trackInteraction(itemId, eventType, additionalData = {}) {
  const visitorId = getVisitorId();

  try {
    await axios.post(`${API_BASE_URL}/track-interaction`, {
      visitor_id: visitorId,
      item_id: itemId,
      event_type: eventType,
      ...additionalData
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-visitor-id': visitorId
      },
      timeout: 5000
    });

    console.log(`📊 Tracked ${eventType} interaction for item ${itemId}`);
    
    // Clear cache after interaction to get fresh recommendations
    if (eventType === 'add_to_cart' || eventType === 'order') {
      clearHomepageRecommendationsCache();
    }

  } catch (error) {
    console.error('❌ Failed to track interaction:', error.message);
    // Don't throw error as tracking is not critical for user experience
  }
}

/**
 * Get trending products
 * @param {number} limit - Number of trending products to fetch
 * @returns {Promise<Array>} Array of trending products
 */
export async function fetchTrendingProducts(limit = 10) {
  try {
    console.log('🔥 Fetching trending products...');
    const response = await axios.get(`${API_BASE_URL}/trending-products`, {
      params: { limit },
      timeout: 8000
    });

    return response.data.products || [];

  } catch (error) {
    console.error('❌ Failed to fetch trending products:', error.message);
    return [];
  }
}

/**
 * Default/fallback recommendations structure
 * @returns {Object} Default recommendations object
 */
function getDefaultRecommendations() {
  return {
    type: 'fallback',
    items: [],
    status: 'error',
    visitor_id: getVisitorId(),
    message: 'Unable to load recommendations at this time'
  };
}

/**
 * Check if recommendations are personalized for the current user
 * @param {Object} recommendations - Recommendations object
 * @returns {boolean} True if recommendations are personalized
 */
export function areRecommendationsPersonalized(recommendations) {
  return recommendations && recommendations.type === 'personalized';
}

/**
 * Get recommendation type display text
 * @param {string} type - Recommendation type
 * @returns {string} Display text for the recommendation type
 */
export function getRecommendationTypeText(type) {
  const typeTexts = {
    'personalized': 'Recommended for You',
    'trending': 'Trending Products',
    'fallback': 'Featured Products'
  };
  
  return typeTexts[type] || 'Recommendations';
}

// Legacy function removal notice - these functions are no longer needed:
// - fetchRecommendations() - replaced with fetchHomepageRecommendations()
// - getCachedRecommendations() - replaced with getCachedHomepageRecommendations()

export default {
  fetchHomepageRecommendations,
  fetchProductRecommendations,
  fetchTrendingProducts,
  trackInteraction,
  getCachedHomepageRecommendations,
  clearHomepageRecommendationsCache,
  areRecommendationsPersonalized,
  getRecommendationTypeText
};