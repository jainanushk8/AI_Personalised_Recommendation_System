// src/routes/item.routes.js
console.log('ITEM ROUTES FILE LOADED - THIS IS A TEST'); // Keep for now, can remove later
const express = require('express');
const router = express.Router();
const { getAllItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers/item.controller'); // Import deleteItem
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Route to create a new item
router.post('/items', authenticate, /* authorize(['admin']), */ createItem);

// Route to get all items
router.get('/items', authenticate, getAllItems);

// Route to get a specific item by ID
router.get('/items/:id', authenticate, getItemById);

// Route to update an item by ID
router.put('/items/:id', authenticate, /* authorize(['admin']), */ updateItem);

// New route to delete an item by ID
// Apply authenticate and optionally authorize (e.g., only 'admin' can delete)
router.delete('/items/:id', authenticate, /* authorize(['admin']), */ deleteItem);

// router.get('/test', (req, res) => {
//   res.send('Test route is working!');
// });

module.exports = router;