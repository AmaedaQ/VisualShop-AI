// routes/interactionRoutes.js

const express = require('express');
const router = express.Router();
const { logInteraction } = require('../controllers/interactionController');

// POST /api/interactions
router.post('/', logInteraction);

module.exports = router;