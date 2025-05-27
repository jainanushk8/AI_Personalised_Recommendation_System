// src/controllers/item.controller.js
const Item = require('../models/Item.model');

const getAllItems = async (req, res, next) => {
  console.log('ITEM CONTROLLER - getAllItems function called');
  try {
    const items = await Item.find();
    console.log('ITEM CONTROLLER - Retrieved items:', items);
    res.json(items);
  } catch (error) {
    console.error('ITEM CONTROLLER - Error fetching items:', error);
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  console.log('ITEM CONTROLLER - getItemById function called with ID:', req.params.id);
  try {
    const item = await Item.findById(req.params.id);
    console.log('ITEM CONTROLLER - Retrieved item:', item);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('ITEM CONTROLLER - Error fetching item by ID:', error);
    next(error);
  }
};

const createItem = async (req, res, next) => {
  console.log('ITEM CONTROLLER - createItem function called with body:', req.body);
  try {
    const { title, content, type, tags } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ message: 'Title, content, and type are required.' });
    }

    const validTypes = ['video', 'article', 'answer'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Must be video, article, or answer.' });
    }

    const newItem = new Item({
      title,
      content,
      type,
      tags,
    });

    const savedItem = await newItem.save();
    console.log('ITEM CONTROLLER - New item created:', savedItem);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('ITEM CONTROLLER - Error creating item:', error);
    next(error);
  }
};

const updateItem = async (req, res, next) => {
    console.log('ITEM CONTROLLER - updateItem function called with ID:', req.params.id, 'and body:', req.body);
    try {
        const { id } = req.params;
        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No update data provided.' });
        }

        if (updates.type && !['video', 'article', 'answer'].includes(updates.type)) {
            return res.status(400).json({ message: 'Invalid type. Must be video, article, or answer.' });
        }

        const updatedItem = await Item.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedItem) {
            console.log('ITEM CONTROLLER - Item not found for update with ID:', id);
            return res.status(404).json({ message: 'Item not found' });
        }

        console.log('ITEM CONTROLLER - Item updated:', updatedItem);
        res.json(updatedItem);
    } catch (error) {
        console.error('ITEM CONTROLLER - Error updating item:', error);
        next(error);
    }
};

// New function to delete an item
const deleteItem = async (req, res, next) => {
    console.log('ITEM CONTROLLER - deleteItem function called with ID:', req.params.id);
    try {
        const { id } = req.params; // Get item ID from URL parameters

        const deletedItem = await Item.findByIdAndDelete(id); // Find and delete the document

        if (!deletedItem) {
            console.log('ITEM CONTROLLER - Item not found for deletion with ID:', id);
            return res.status(404).json({ message: 'Item not found' });
        }

        console.log('ITEM CONTROLLER - Item deleted:', deletedItem);
        // Send a success message, typically 204 No Content for successful deletion
        res.status(204).send(); // Or res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('ITEM CONTROLLER - Error deleting item:', error);
        next(error); // Pass error to the error handling middleware
    }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem }; // Export deleteItem