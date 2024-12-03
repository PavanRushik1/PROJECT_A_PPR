// /models/containerModel.js

const mongoose = require('mongoose');

// Define the schema for the Container
const containerSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true // Automatically generate unique ID if not provided
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    parents: [{
        type: mongoose.Schema.Types.ObjectId, // Array of container IDs (ObjectIds)
        ref: 'Container' // Reference to the same Container schema (self-referencing)
    }],
    children: [{
        type: mongoose.Schema.Types.ObjectId, // Array of container IDs (ObjectIds)
        ref: 'Container' // Reference to the same Container schema (self-referencing)
    }],
    containerInfo: {
        name: {
            type: String,
            required: true,
            unique: false // Set to false here; we’ll add custom validation below
        },
        date_of_creation: {
            type: Date,
            default: Date.now // Set default to current date
        },
        settings: {
            scope: {
                type: String,
                enum: ['public', 'private'],
                required: true
            },
            getLink: {
                type: String,
                enum: ['public', 'private'],
                required: true
            },
            putLink: {
                type: String,
                enum: ['public', 'private'],
                required: true
            },
            searching: {
                type: String,
                enum: ['public', 'private'],
                required: true
            }
        }
    }
});

// Custom validation for unique `name` based on `scope`
containerSchema.path('containerInfo.name').validate(async function(name) {
    const { scope } = this.containerInfo.settings;

    // If scope is 'private', name + owner combination must be unique
    const query = scope === 'private'
        ? { 'containerInfo.name': name, owner: this.owner, 'containerInfo.settings.scope': 'private' }
        : { 'containerInfo.name': name, 'containerInfo.settings.scope': 'public' };

    const existingContainer = await this.constructor.findOne(query);
    return !existingContainer; // Return true if no container found, making the name unique
}, 'Container name must be unique within its scope.');

const Container = mongoose.model('Container', containerSchema);
module.exports = Container;
