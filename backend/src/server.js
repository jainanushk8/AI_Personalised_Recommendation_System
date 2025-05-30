// src/server.js
const app = require('./app'); // Your Express app setup
const connectDB = require('./config/db'); // Your MongoDB connection logic
require('dotenv').config(); // Load environment variables from .env file

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB and start server:', err);
    process.exit(1); // Exit process with failure
});