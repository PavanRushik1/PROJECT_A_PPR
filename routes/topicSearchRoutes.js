// /routes/topicSearchRoutes.js

const express = require('express');
const router = express.Router();
const Container = require('../models/containerModel');
const Topic = require('../models/topicModel');

// POST route to search for topics
router.post('/', async (req, res) => {
    const { containerId, numberOfTopics, timeRange, avoidContainers } = req.body;

    try {
        // Function to perform BFS, but going up through parents instead of children
        const bfs = async (startId) => {
            const queue = [startId];
            const visited = new Set();
            const results = [];

            while (queue.length > 0 && results.length < numberOfTopics) {
                const currentId = queue.shift();
                
                if (visited.has(currentId)) continue; // Skip already visited containers
                visited.add(currentId);

                // Fetch topics for the current container
                const container = await Container.findOne({ id: currentId });

                if (container) {
                    // Fetch topics that match the time range
                    const topics = await Topic.find({
                        origin: currentId,
                        date: { $gte: timeRange.start, $lte: timeRange.end }
                    });

                    // Add topics to results
                    results.push(...topics);

                    // Enqueue parent containers that are not in the avoid list
                    for (const parentId of container.parents) {
                        if (!avoidContainers.includes(parentId.toString()) && !visited.has(parentId.toString())) {
                            queue.push(parentId.toString());
                        }
                    }
                }
            }
            return results;
        };

        // Start BFS from the given container ID
        const topics = await bfs(containerId);

        // Limit results to the specified number of topics
        const limitedTopics = topics.slice(0, numberOfTopics);

        res.status(200).json(limitedTopics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Export the router
module.exports = router;