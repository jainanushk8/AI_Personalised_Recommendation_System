// src/routes/item.routes.js
console.log('ITEM ROUTES FILE LOADED - THIS IS A TEST');
const express = require('express');
const router = express.Router();
const { getAllItems, getItemById, createItem, updateItem, deleteItem, findDuplicates } = require('../controllers/item.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// --- Routes to get or delete a specific item by ID (these are general with :id) ---
// Note: These should typically come AFTER more specific static routes

// NEW ROUTE TO FIND DUPLICATE ITEMS - MOVE THIS UP!
router.get('/items/duplicates', authenticate, findDuplicates); // <--- THIS ROUTE MUST BE DEFINED FIRST!

// Route to get a specific item by ID (This is more general with :id)
router.get('/items/:id', authenticate, getItemById);

// New route to delete an item by ID
router.delete('/items/:id', authenticate, /* authorize(['admin']), */ deleteItem);


// --- Other item routes (order of these generally doesn't matter as much relative to each other) ---

// Route to create a new item
router.post('/items', authenticate, /* authorize(['admin']), */ createItem);

// Route to get all items
router.get('/items', authenticate, getAllItems); // This is also a GET /items, but without :id, so fine.

// Route to update an item by ID
router.put('/items/:id', authenticate, /* authorize(['admin']), */ updateItem);


// router.get('/test', (req, res) => {
//   res.send('Test route is working!');
// });

module.exports = router;