// /routes/containerSearchRoutes.js

const express = require('express');
const router = express.Router();
const Container = require('../models/containerModel');

// POST route to search containers by prefix for private scope
router.post('/private', async (req, res) => {
    try {
        const { prefix, limit } = req.body;
        const userId = req.userId; // Assume userId is available from auth middleware

        // Validate input
        if (!prefix || typeof prefix !== 'string') {
            return res.status(400).json({ message: 'A valid prefix is required' });
        }

        // Build query for private containers owned by the user
        const containers = await Container.find({
            owner: userId,
            'containerInfo.name': { $regex: `^${prefix}`, $options: 'i' } // Prefix match
        }).limit(limit || 10); // Limit the number of results returned, default is 10

        // Return found containers
        res.status(200).json(containers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to search containers by prefix for public scope
router.post('/public', async (req, res) => {
    try {
        const { prefix, limit } = req.body;

        // Validate input
        if (!prefix || typeof prefix !== 'string') {
            return res.status(400).json({ message: 'A valid prefix is required' });
        }

        // Build query for public containers
        const containers = await Container.find({
            'containerInfo.settings.scope': 'public', // Only public containers
            $or: [
                // If searching is public, allow prefix matching
                {
                    'containerInfo.settings.searching': 'public',
                    'containerInfo.name': { $regex: `^${prefix}`, $options: 'i' }
                },
                // If searching is private, full name must be provided
                {
                    'containerInfo.settings.searching': 'private',
                    'containerInfo.name': prefix // Full name match
                }
            ]
        }).limit(limit || 10); // Limit the number of results returned, default is 10

        // Return found containers
        res.status(200).json(containers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
