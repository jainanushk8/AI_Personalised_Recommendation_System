// src/models/Interaction.model.js
const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  type: { type: String, enum: ['view', 'click', 'like', 'save'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Interaction', interactionSchema);