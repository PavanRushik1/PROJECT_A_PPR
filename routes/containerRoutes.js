// /routes/containerRoutes.js

const express = require('express');
const router = express.Router();
const Container = require('../models/containerModel');
const Topic = require('../models/topicModel');

// POST route to create a new container
router.post('/', async (req, res) => {
    try {
        const { ownerId, parents, children, containerInfo } = req.body;

        // Check if all specified parent containers exist
        if (parents && parents.length > 0) {
            const existingParents = await Container.find({ _id: { $in: parents } });
            if (existingParents.length !== parents.length) {
                return res.status(400).json({ message: 'One or more parent containers do not exist' });
            }
        }

        // Check if all specified child containers exist
        if (children && children.length > 0) {
            const existingChildren = await Container.find({ _id: { $in: children } });
            if (existingChildren.length !== children.length) {
                return res.status(400).json({ message: 'One or more child containers do not exist' });
            }
        }

        // Create a new container instance
        const newContainer = new Container({
            owner: ownerId,
            parents,
            children,
            containerInfo
        });

        // Save the container to the database
        await newContainer.save();
        res.status(201).json(newContainer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to delete a container
router.post('/delete', async (req, res) => {
    try {
        const { containerId } = req.body;

        // Find the container to be deleted
        const containerToDelete = await Container.findById(containerId);
        
        if (!containerToDelete) {
            return res.status(404).json({ message: 'Container not found' });
        }

        // Unlink the container from its parents
        await Container.updateMany(
            { _id: { $in: containerToDelete.parents } },
            { $pull: { children: containerToDelete._id } }
        );

        // Unlink the container from its children
        await Container.updateMany(
            { _id: { $in: containerToDelete.children } },
            { $pull: { parents: containerToDelete._id } }
        );

        // Delete topics related to this container (assuming topics have an `origin` field referencing the container)
        await Topic.deleteMany({ origin: containerToDelete._id });

        // Delete the container itself
        await containerToDelete.deleteOne();

        res.status(200).json({ message: 'Container deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
