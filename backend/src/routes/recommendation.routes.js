// src/routes/recommendation.routes.js
const express = require('express');
const router = express.Router();
const { getRecommendationsForUser } = require('../controllers/recommendation.controller'); // Will create this function
const { authenticate } = require('../middlewares/auth.middleware');

// Route to get personalized recommendations for a specific user
// Requires authentication as recommendations are user-specific
router.get('/forUser/:userId', authenticate, getRecommendationsForUser);

module.exports = router;