// /models/linkRequestModel.js

const mongoose = require('mongoose');

// Define the LinkRequest schema
const linkRequestSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true // Automatically generates an ID for each link request
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Container', // Reference to the container making the request
        required: true
    },
    targetContainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Container', // Reference to the container to be linked to
        required: true
    },
    requestee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (the one being requested)
        required: true
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    link: {
        type: String,
        enum: ['getLink', 'putLink'], // Type of link being requested
        required: true
    }
});

const LinkRequest = mongoose.model('LinkRequest', linkRequestSchema);
module.exports = LinkRequest;
