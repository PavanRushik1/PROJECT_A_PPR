// /routes/topicRoutes.js

const express = require('express');
const router = express.Router();
const Topic = require('../models/topicModel');
const Container = require('../models/containerModel'); // Import the Container model

// POST route to create a new topic
router.post('/', async (req, res) => {
    try {
        const { origin, topicInfo } = req.body;

        // Check if the container with the given origin ID exists
        const existingContainer = await Container.findOne({ id: origin });
        
        if (!existingContainer) {
            return res.status(404).json({ message: 'Origin container not found' });
        }

        // Create a new topic instance
        const newTopic = new Topic({
            origin,
            topicInfo
        });

        // Save the topic to the database
        await newTopic.save();
        res.status(201).json(newTopic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE route to delete a topic
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the topic by its id
        const deletedTopic = await Topic.findOneAndDelete({ id });
        
        if (!deletedTopic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        // Return success message
        res.status(200).json({ message: 'Topic deleted successfully', deletedTopic });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
