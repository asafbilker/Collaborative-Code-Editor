const express = require('express');
const router = express.Router();
const CodeBlock = require('../models/CodeBlock');

// Get all code blocks
router.get('/', async (req, res) => {
    try {
        const codeBlocks = await CodeBlock.find({}, 'title');
        res.json(codeBlocks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching code blocks' });
    }
});

// Get a specific code block by ID
router.get('/:id', async (req, res) => {
    try {
        const codeBlock = await CodeBlock.findById(req.params.id);
        if (!codeBlock) return res.status(404).json({ message: 'Code block not found' });
        res.json(codeBlock);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching code block' });
    }
});

module.exports = router;
