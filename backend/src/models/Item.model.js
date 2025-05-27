// src/models/Item.model.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['video', 'article', 'answer'], required: true },
  tags: { type: [String], default: [] },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Item', itemSchema);