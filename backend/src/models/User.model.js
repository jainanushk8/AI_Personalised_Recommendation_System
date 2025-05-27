// src/models/User.model.js
const mongoose = require('mongoose');

// Define a sub-schema for individual user interactions
const userInteractionSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', // Reference to the Item model
    required: true,
  },
  interactionType: { // What kind of interaction (e.g., 'view', 'like', 'bookmark', 'complete', 'search')
    type: String,
    enum: ['view', 'like', 'dislike', 'bookmark', 'complete', 'rating', 'search_query_match'],
    required: true,
  },
  timestamp: { // When the interaction occurred
    type: Date,
    default: Date.now,
  },
  duration: { // For video/article views, how long they engaged (in seconds/minutes)
    type: Number,
    min: 0,
    // required: false, // Optional, only for 'view' interactions
  },
  rating: { // For 'rating' interactionType
    type: Number,
    min: 1,
    max: 5,
    // required: false, // Optional, only for 'rating' interactions
  },
  // Add other fields as needed for specific interaction types (e.g., 'search_query' for search_query_match)
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { // Assuming you might have roles like 'user' (student) or 'admin'
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // New field to store detailed interaction history
  interactionHistory: [userInteractionSchema], // Array of interaction sub-documents
  // You might also add fields for explicit preferences later, e.g.:
  // preferredTopics: { type: [String], default: [] },
  // academicLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
}, {
  timestamps: true, // Adds createdAt and updatedAt to the User document itself
});

module.exports = mongoose.model('User', userSchema);