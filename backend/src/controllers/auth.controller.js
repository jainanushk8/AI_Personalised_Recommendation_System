// src/controllers/auth.controller.js
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup controller
const signup = async (req, res, next) => {
  console.log('AUTH CONTROLLER - signup function called');
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user', // Default role to 'user' if not provided
    });

    await user.save();
    console.log('AUTH CONTROLLER - User registered:', user.email);

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('AUTH CONTROLLER - Error during signup:', error);
    next(error);
  }
};

// Login controller
const login = async (req, res, next) => {
  console.log('AUTH CONTROLLER - login function called');
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('AUTH CONTROLLER - User logged in:', user.email);

    // --- IMPORTANT CHANGE HERE ---
    // Include user _id and other non-sensitive data in the response
    res.json({
      token,
      user: { // Add a user object to the response
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role, // Include role if you've added it to User.model
      }
    });
    // --- END IMPORTANT CHANGE ---

  } catch (error) {
    console.error('AUTH CONTROLLER - Error during login:', error);
    next(error);
  }
};

module.exports = { signup, login };