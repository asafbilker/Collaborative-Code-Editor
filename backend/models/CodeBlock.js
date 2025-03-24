const mongoose = require('mongoose');

// define structure for each block
const CodeBlockSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true }, // title shown in lobby
    initialCode: { type: String, required: true }, // starter code for student
    solution: { type: String, required: true }, // correct code for smiley match
    description: { type: String } // question explanation shown in page
});

// connect schema to mongo collection
const CodeBlock = mongoose.model('CodeBlock', CodeBlockSchema);

module.exports = CodeBlock;
