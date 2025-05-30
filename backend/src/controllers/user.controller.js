// src/controllers/user.controller.js
const User = require('../models/User.model');
const mongoose = require('mongoose');

const recordUserInteraction = async (req, res, next) => {
    console.log('USER CONTROLLER - recordUserInteraction called.');
    try {
        const { userId } = req.params;
        const { itemId, interactionType, duration, rating, searchQuery } = req.body;

        // Basic validation for required fields
        if (!itemId || !interactionType) {
            return res.status(400).json({ message: 'itemId and interactionType are required.' });
        }

        // Validate itemId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Invalid itemId format.' });
        }

        // Optional: Ensure the authenticated user (req.user._id) matches the userId in params
        // This is important for security - users should only record their own interactions
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized: Cannot record interactions for another user.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newInteraction = {
            itemId,
            interactionType,
            timestamp: new Date(), // Always record current time
        };

        // Add optional fields based on interactionType
        if (duration !== undefined && interactionType === 'view') {
            newInteraction.duration = duration;
        }
        if (rating !== undefined && interactionType === 'rating') {
            newInteraction.rating = rating;
        }
        if (searchQuery !== undefined && interactionType === 'search_query_match') {
            newInteraction.searchQuery = searchQuery; // Add a 'searchQuery' field to schema if needed
        }

        user.interactionHistory.push(newInteraction);
        await user.save();

        console.log(`USER CONTROLLER - Interaction recorded for user ${userId}:`, newInteraction);
        res.status(200).json({ message: 'Interaction recorded successfully!', interaction: newInteraction });

    } catch (error) {
        console.error('USER CONTROLLER - Error recording user interaction:', error);
        next(error); // Pass error to error handling middleware
    }
};

// Optional: A function to get a user's profile including their history
const getUserProfile = async (req, res, next) => {
    console.log('USER CONTROLLER - getUserProfile called for ID:', req.params.userId);
    try {
        const { userId } = req.params;

        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized: Cannot view another user\'s profile.' });
        }

        // Populate interactionHistory with actual item details if needed
        const user = await User.findById(userId).populate('interactionHistory.itemId', 'title type tags'); // Populate fields from Item model

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Exclude sensitive data like password hash
        const userProfile = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            interactionHistory: user.interactionHistory,
        };

        res.status(200).json(userProfile);

    } catch (error) {
        console.error('USER CONTROLLER - Error getting user profile:', error);
        next(error);
    }
};


module.exports = {
    recordUserInteraction,
    getUserProfile,
};
