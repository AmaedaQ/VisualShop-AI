# VisualShop-AI: AI-Powered Visual E-Commerce Platform

> ⚠️ **Disclaimer:** This codebase is a sanitized, anonymized version of a real-world freelance project executed as part of a university capstone initiative. All proprietary identifiers and client branding have been removed. The project is shared here strictly for demonstration of full-stack engineering, AI integration, and architectural design.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-v18+-orange.svg)](https://reactjs.org/)

---

##  Overview

**VisualShop-AI** is a modular, AI-augmented e-commerce platform built using a microservices architecture. It blends traditional shopping workflows with intelligent computer vision and personalized recommendations, simulating a next-gen shopping experience.

---

## 🎯 Key Features

###  Visual Search (CLIP + FAISS)

* Upload an image to retrieve visually similar products using OpenAI's CLIP embeddings + FAISS vector similarity
* Fully integrated into product listing and search flow

###  Personalized Recommendations

* Behavior-aware product suggestions powered by Gorse
* Real-time adaptation to user activity

###  Core E-Commerce Engine

* Secure user auth (JWT), cart, wishlist, order flow
* Product detail pages with ratings & reviews
* SQL-based order and inventory management

###  Conversational Support

* Context-aware chatbot integration
* Pre-trained assistant for product-related queries and basic navigation

---

##  Tech Stack Breakdown

###  Frontend

* React 18+ w/ functional components & hooks
* Axios for service-level API communication
* Bootstrap / Material UI for UI/UX
* Responsive and accessible design patterns

###  Backend

* Node.js + Express
* MySQL (RDBMS)
* JWT-based user authentication
* RESTful APIs with service-layer architecture

###  AI Services

* Python 3.8+
* OpenAI CLIP for feature extraction
* FAISS for fast similarity search
* Gorse engine for collaborative filtering

---

##  Architecture Overview

```
📁 react-frontend             → User interface (React)
📁 nodejs-backend             → Auth, cart, product API (Node.js + Express)
📁 visual-search-api          → CLIP + FAISS microservice (Python)
📁 recommendation-service     → Gorse-based recommendation system
📁 chatbot-setup              → Chatbot UI and integration logic
📄 db.sql                     → Complete MySQL schema + seed data
```

---

##  Quick Setup Guide

### Prerequisites

* Node.js v16+
* Python 3.8+
* MySQL

### Installation Workflow

```bash
# Clone project
$ git clone https://github.com/yourusername/VisualShop-AI.git
$ cd VisualShop-AI

# Setup Backend
$ cd nodejs-backend
$ npm install
# Copy .env.example → .env and fill in DB and JWT settings

# Setup Frontend
$ cd ../react-frontend
$ npm install

# Setup Visual Search API
$ cd ../visual-search-api
$ python -m venv venv
$ source venv/bin/activate  # Windows: .\venv\Scripts\activate
$ pip install -r requirements.txt

# Start Backend
$ cd ../nodejs-backend && npm start

# Start Frontend
$ cd ../react-frontend && npm start

# Start Visual Search
$ cd ../visual-search-api && python app.py
```

---

##  Testing & QA

* Frontend: Manual flow testing via browser / Lighthouse
* Backend: Postman for endpoint validation
* Visual Search: Upload sample image and verify match accuracy
* Recommender: Simulate interactions, verify product suggestions

---

##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

##  Author's Note

As the lead developer, I was responsible for designing and implementing the end-to-end architecture, from database schema to production-ready microservices. This repo serves as a consolidated portfolio artifact to demonstrate my ability to deliver scalable, full-stack systems with AI integration.

> Recruiters and collaborators may request private access to deployment videos or walkthrough documentation by contacting me directly.

---

##  Credits

* OpenAI CLIP – [https://github.com/openai/CLIP](https://github.com/openai/CLIP)
* FAISS by Facebook AI – [https://github.com/facebookresearch/faiss](https://github.com/facebookresearch/faiss)
* Gorse Recommendation Engine – [https://github.com/gorse-io/gorse](https://github.com/gorse-io/gorse)
* Bootstrap / Material UI
* The original academic team for permitting this refactored showcase
