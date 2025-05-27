// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { recordUserInteraction, getUserProfile } = require('../controllers/user.controller'); // Will create these
const { authenticate } = require('../middlewares/auth.middleware');

// Route to record a user's interaction with an item
// This is secured, only the authenticated user can record their own interactions
router.post('/:userId/interactions', authenticate, recordUserInteraction);

// (Optional) Route to get user's profile and history
router.get('/:userId', authenticate, getUserProfile);


module.exports = router;