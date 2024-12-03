// app.js

const express = require('express');
const mongoose = require('mongoose');

// Initialize the app
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB connection using Mongoose
(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mydatabase', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
})();

// Import routes
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./middleware/authMiddleware');
const containerRoutes = require('./routes/containerRoutes');
const topicRoutes = require('./routes/topicRoutes');
const linkingRoutes = require('./routes/linkingRoutes');
const topicSearchRoutes = require('./routes/topicSearchRoutes');
const containerSearchRoutes = require('./routes/containerSearchRoutes');

// Use routes
app.use('/auth', authRoutes); // Public route

// Apply authentication middleware for all other routes
app.use(authenticate);

app.use('/containers', containerRoutes);
app.use('/topics', topicRoutes);
app.use('/link', linkingRoutes);
app.use('/topicsearch', topicSearchRoutes);
app.use('/containersearch', containerSearchRoutes);



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
