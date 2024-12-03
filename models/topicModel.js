// /models/topicModel.js

const mongoose = require('mongoose');

// Define the schema for the Topic
const topicSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true // Automatically generate unique ID if not provided
    },
    date: {
        type: Date,
        default: Date.now // Set default to current date
    },
    origin: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a container's ID
        ref: 'Container', // Reference to the Container model
        required: true // Make origin required
    },
    topicInfo: {
        name: {
            type: String,
            unique: true, // Ensure topic name is unique
            required: true // Make name required
        },
        content: {
            type: String,
            required: true // Make content required
        }
    }
});

// Create and export the Topic model
const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;
