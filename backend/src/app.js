// src/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/item.routes');
const userRoutes = require('./routes/user.routes'); // <--- ADD THIS LINE
const recommendationRoutes = require('./routes/recommendation.routes'); // <--- ADD THIS LINE
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json


// TEST MIDDLEWARE - ADD THIS
app.use((req, res, next) => {
  console.log('APP.JS - Request received:', req.method, req.url);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/', itemRoutes); //
app.use('/users', userRoutes); // <--- ADD THIS LINE - All user-specific routes will start with /users
app.use('/recommendations', recommendationRoutes); // <--- ADD THIS LINE - All recommendation routes start with /recommendations

// Error handling middleware (should be the last middleware)
app.use(errorHandler);

module.exports = app;