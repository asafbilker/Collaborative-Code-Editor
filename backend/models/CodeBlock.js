const mongoose = require('mongoose');

const CodeBlockSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    initialCode: { type: String, required: true },
    solution: { type: String, required: true }
});

const CodeBlock = mongoose.model('CodeBlock', CodeBlockSchema);

module.exports = CodeBlock;
