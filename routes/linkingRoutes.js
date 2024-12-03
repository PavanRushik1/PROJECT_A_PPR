// /routes/linkingRoutes.js

const express = require('express');
const router = express.Router();
const Container = require('../models/containerModel');
const LinkRequest = require('../models/linkRequestModel');

// POST route to create a getLink between a container and its parent
router.post('/getLink', async (req, res) => {
    try {
        const { containerId, parentId } = req.body;

        // Find the container and parent container by their IDs
        const container = await Container.findOne({ id: containerId });
        const parentContainer = await Container.findOne({ id: parentId });

        if (!container || !parentContainer) {
            return res.status(404).json({ message: 'Container or parent container not found' });
        }

        // Verify that the request user owns the container
        if (container.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to link this container' });
        }

        // Check the getLink property of the parent container
        if (parentContainer.settings.getLink === 'private') {
            // Check if a link request already exists for getLink
            const existingRequest = await LinkRequest.findOne({
                requestedBy: container.id,
                targetContainer: parentContainer.id,
                link: 'getLink'
            });

            if (existingRequest) {
                return res.status(400).json({ message: 'Link request for getLink already exists' });
            }

            // Create a new link request for getLink
            const newLinkRequest = new LinkRequest({
                requestedBy: container.id,
                targetContainer: parentContainer.id,
                link: 'getLink'
            });

            await newLinkRequest.save();
            return res.status(201).json({ message: 'Link request for getLink created successfully' });
        } else if (parentContainer.settings.getLink === 'public') {
            // Directly link the containers
            container.parents.push(parentContainer.id);
            parentContainer.children.push(container.id);

            await container.save();
            await parentContainer.save();

            return res.status(200).json({ message: 'getLink created successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid getLink setting' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to create a putLink between a container and its child
router.post('/putLink', async (req, res) => {
    try {
        const { containerId, childId } = req.body;

        // Find the container and child container by their IDs
        const container = await Container.findOne({ id: containerId });
        const childContainer = await Container.findOne({ id: childId });

        if (!container || !childContainer) {
            return res.status(404).json({ message: 'Container or child container not found' });
        }

        // Verify that the request user owns the container
        if (container.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to link this container' });
        }

        // Check the putLink property of the child container
        if (childContainer.settings.putLink === 'private') {
            // Check if a link request already exists for putLink
            const existingRequest = await LinkRequest.findOne({
                requestedBy: container.id,
                targetContainer: childContainer.id,
                link: 'putLink'
            });

            if (existingRequest) {
                return res.status(400).json({ message: 'Link request for putLink already exists' });
            }

            // Create a new link request for putLink
            const newLinkRequest = new LinkRequest({
                requestedBy: container.id,
                targetContainer: childContainer.id,
                link: 'putLink'
            });

            await newLinkRequest.save();
            return res.status(201).json({ message: 'Link request for putLink created successfully' });
        } else if (childContainer.settings.putLink === 'public') {
            // Directly link the containers
            container.children.push(childContainer.id);
            childContainer.parents.push(container.id);

            await container.save();
            await childContainer.save();

            return res.status(200).json({ message: 'putLink created successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid putLink setting' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to unlink a getLink between two containers
router.post('/unlinkGet', async (req, res) => {
    try {
        const { containerId, parentId } = req.body;

        // Find the container and parent container
        const container = await Container.findOne({ id: containerId });
        const parentContainer = await Container.findOne({ id: parentId });

        if (!container || !parentContainer) {
            return res.status(404).json({ message: 'Container or parent container not found' });
        }

        // Verify that the container is linked to the parent via getLink
        if (!container.parents.includes(parentContainer.id)) {
            return res.status(400).json({ message: 'No getLink exists between the container and the parent' });
        }

        // Unlink the getLink
        container.parents = container.parents.filter(parent => parent.toString() !== parentContainer.id.toString());
        parentContainer.children = parentContainer.children.filter(child => child.toString() !== container.id.toString());

        await container.save();
        await parentContainer.save();

        res.status(200).json({ message: 'getLink unlinked successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to unlink a putLink between two containers
router.post('/unlinkPut', async (req, res) => {
    try {
        const { containerId, childId } = req.body;

        // Find the container and child container
        const container = await Container.findOne({ id: containerId });
        const childContainer = await Container.findOne({ id: childId });

        if (!container || !childContainer) {
            return res.status(404).json({ message: 'Container or child container not found' });
        }

        // Verify that the container is linked to the child via putLink
        if (!container.children.includes(childContainer.id)) {
            return res.status(400).json({ message: 'No putLink exists between the container and the child' });
        }

        // Unlink the putLink
        container.children = container.children.filter(child => child.toString() !== childContainer.id.toString());
        childContainer.parents = childContainer.parents.filter(parent => parent.toString() !== container.id.toString());

        await container.save();
        await childContainer.save();

        res.status(200).json({ message: 'putLink unlinked successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to get link requests made by the user (filter by link type)
router.post('/madebyme', async (req, res) => {
    try {
        const { userId, linkType } = req.body; // Assuming you send user ID and linkType in the body

        if (!linkType || !['getLink', 'putLink'].includes(linkType)) {
            return res.status(400).json({ message: 'Invalid linkType. It should be either "getLink" or "putLink".' });
        }

        // Find link requests made by the user with the specified linkType
        const linkRequests = await LinkRequest.find({ 
            requestedBy: userId,
            link: linkType
        });

        res.status(200).json(linkRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to get link requests made to the user (filter by link type)
router.post('/madetome', async (req, res) => {
    try {
        const { userId, linkType } = req.body; // Assuming you send user ID and linkType in the body

        if (!linkType || !['getLink', 'putLink'].includes(linkType)) {
            return res.status(400).json({ message: 'Invalid linkType. It should be either "getLink" or "putLink".' });
        }

        // Find link requests made to the user with the specified linkType
        const linkRequests = await LinkRequest.find({ 
            targetContainer: userId,
            link: linkType
        });

        res.status(200).json(linkRequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to accept a link request for a private container (with link type handling)
router.post('/acceptlinkrequest', async (req, res) => {
    try {
        const { requestId } = req.body; // ID of the link request

        // Find the link request by ID
        const linkRequest = await LinkRequest.findById(requestId);
        if (!linkRequest) {
            return res.status(404).json({ message: 'Link request not found' });
        }

        // Ensure the link request is of the appropriate type ('getLink' or 'putLink')
        if (!linkRequest.link || !['getLink', 'putLink'].includes(linkRequest.link)) {
            return res.status(400).json({ message: 'Invalid link type in the request' });
        }

        // Get parent and child containers based on the link type
        let parentContainer, childContainer;

        if (linkRequest.link === 'getLink') {
            parentContainer = await Container.findOne({ id: linkRequest.targetContainer });
            childContainer = await Container.findOne({ id: linkRequest.requestedBy });
        } else if (linkRequest.link === 'putLink') {
            parentContainer = await Container.findOne({ id: linkRequest.requestedBy });
            childContainer = await Container.findOne({ id: linkRequest.targetContainer });
        }

        if (!parentContainer || !childContainer) {
            return res.status(404).json({ message: 'Container(s) not found' });
        }

        // Check if the containers are already linked
        if (childContainer.parents.includes(parentContainer.id)) {
            return res.status(400).json({ message: 'Containers are already linked' });
        }

        // Link the containers based on the link type
        if (linkRequest.link === 'getLink') {
            // If the link type is 'getLink', link child container to parent
            childContainer.parents.push(parentContainer.id);
            await childContainer.save();
            parentContainer.children.push(childContainer.id);
            await parentContainer.save();
        } else if (linkRequest.link === 'putLink') {
            // If the link type is 'putLink', link parent container to child
            parentContainer.children.push(childContainer.id);
            await parentContainer.save();
            childContainer.parents.push(parentContainer.id);
            await childContainer.save();
        }

        // Remove the link request after successful linking
        await LinkRequest.findByIdAndDelete(requestId);

        res.status(200).json({ message: 'Link request accepted and containers linked successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to cancel a link request
router.post('/cancellinkrequest', async (req, res) => {
    try {
        const { requestId } = req.body; // ID of the link request to cancel

        // Find and delete the link request by ID
        const deletedRequest = await LinkRequest.findByIdAndDelete(requestId);

        // Check if the link request was found and deleted
        if (!deletedRequest) {
            return res.status(404).json({ message: 'Link request not found' });
        }

        res.status(200).json({ message: 'Link request canceled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
