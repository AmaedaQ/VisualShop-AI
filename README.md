#  VisualShop-AI — Full-Stack AI-Powered E-Commerce Platform

> ⚠️ **Disclaimer:** This codebase is a restructured version of a freelance client project originally developed for a university FYP team. All proprietary data and branding have been removed. Shared for demonstration of engineering capabilities, AI integration, and architecture design.

---

##  Overview

**VisualShop-AI** is a microservices-based, full-stack e-commerce system that combines AI-powered visual search, intelligent recommendations, conversational support, and smart inventory forecasting — designed to scale across multi-vendor ecosystems.

---

##  Core Feature Highlights

###  User-Facing Capabilities
- **Visual Search**: Upload an image → retrieve visually similar products via CLIP + FAISS
- **Smart Recommendations**: Hybrid engine (collaborative + content-based) powered by Gorse & TF-IDF
- **Shopping Experience**: Cart, wishlist, multi-filter product browsing, product comparisons
- **Personalization**: Recently viewed, saved preferences, custom offers, and discounts
- **Order Management**: Place/track orders, manage returns/refunds, view history
- **AI Chat Assistant**: Product queries, order status, guided navigation (24/7 support)

###  Seller Dashboard Capabilities
- **Product Management**: Add/edit/delete products, set pricing, upload images/specs, bulk upload
- **Inventory Intelligence**:
  - Realtime stock tracking, reorder alerts, and stock status automation
  - Priority scoring based on sales, views, and inventory levels
  - Batch updates and reorder optimization tools
- **Order Fulfillment**: Manage orders, process returns, update shipping statuses
- **Customer Insights**: Analyze purchase behavior, conversion rates, segment users
- **Sales Analytics**: Monitor revenue, trends, top-performing SKUs, and generate custom reports
- **Configuration & Settings**: Tax, payments, shipping, store preferences, API integrations

---

##  AI Systems (Backend Intelligence)

###  Hybrid Recommendation System
- **Collaborative Filtering**: Weighted interaction scoring (view=1, cart=2, order=3), time-sensitive (last 30 days)
- **Content-Based Matching**: TF-IDF on descriptions, features, and categories
- **Trending Engine**: TTL caching for hot products (based on sales/views)
- **Fallback Handling**: Cold-start logic for new users or sparse data
- **Performance**: Scored ranking, real-time recommendations, and cache optimization

###  Smart Inventory Forecasting
- Real-time stock intelligence + auto status labeling (In Stock / Low / Out of Stock)
- Scoring Algorithm:
  - Stock Level (50 pts if OOS), Views (up to 50), Sales (up to 100), Freshness Bonus
  - Tiered Priority: Critical (≥100), Moderate (≥30), Low (<30)
- Smart Tools:
  - Reorder suggestions, trend analytics, and inventory heatmaps

---

##  Tech Stack

| Layer      | Tech Stack                            |
|------------|----------------------------------------|
| Frontend   | React 18+, Axios, Bootstrap / MUI      |
| Backend    | Node.js + Express, MySQL, JWT          |
| AI/ML      | Python 3.8+, CLIP, FAISS, Gorse        |
| Infra      | Microservices architecture             |
| Others     | REST APIs, Caching, JWT Auth           |

---

##  Directory Structure

```
📁 react-frontend          → Frontend UI (React)
📁 nodejs-backend          → REST API server (Node.js + MySQL)
📁 visual-search-api       → Image-to-product matching (CLIP + FAISS)
📁 recommendation-service  → Gorse-powered recommender system
📁 chatbot-setup           → AI chatbot and product assistant
📄 db.sql                  → Full MySQL schema and sample seed data
```

---

##  Setup Instructions

### Prerequisites
- Node.js v16+
- Python 3.8+
- MySQL 8.x

### Install & Run

```bash
# Clone the project
git clone https://github.com/yourusername/VisualShop-AI.git
cd VisualShop-AI

# Backend
cd nodejs-backend
npm install
# Add .env file
npm start

# Frontend
cd ../react-frontend
npm install
npm start

# Visual Search API
cd ../visual-search-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

---

##  QA & Testing

- API: Postman & Swagger testing
- UI: Manual UX validation + Lighthouse performance checks
- Recommender: Simulated user events & interaction logging
- Inventory: Sales simulation to validate stock status updates
- Chatbot: Contextual product + order queries

---

## Author's Note

I led the full system architecture, backend logic, AI integrations, and frontend engineering. This project serves as a comprehensive proof of capability in building scalable, modular, and intelligent commerce systems that merge data science, product thinking, and engineering depth.

> Recruiters: Private demo, code walkthrough, and video access available on request.

---

## Acknowledgments

- [OpenAI CLIP](https://github.com/openai/CLIP)
- [Facebook FAISS](https://github.com/facebookresearch/faiss)
- [Gorse Recommendation System](https://github.com/gorse-io/gorse)
- MUI / Bootstrap

---

## License

This project is licensed under the [MIT License](LICENSE).
