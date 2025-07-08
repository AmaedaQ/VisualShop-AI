const express = require("express");
const { chatbotResponse } = require("../controllers/chatbotController");

const router = express.Router();

/**
 * API route to handle chatbot queries from frontend
 */
router.post("/", chatbotResponse);

module.exports = router;