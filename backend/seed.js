require('dotenv').config();
const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlock');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Define initial code blocks
        const initialCodeBlocks = [
            {
                title: "Async case",
                initialCode: "async function fetchData() {\n    // TODO: Implement fetching data\n}",
                solution: "async function fetchData() {\n    return await fetch('https://api.example.com/data');\n}"
            },
            {
                title: "Array Sum",
                initialCode: "function sumArray(arr) {\n    // TODO: Implement sum logic\n}",
                solution: "function sumArray(arr) {\n    return arr.reduce((a, b) => a + b, 0);\n}"
            },
            {
                title: "Reverse String",
                initialCode: "function reverseString(str) {\n    // TODO: Implement reversal\n}",
                solution: "function reverseString(str) {\n    return str.split('').reverse().join('');\n}"
            },
            {
                title: "Factorial",
                initialCode: "function factorial(n) {\n    // TODO: Implement factorial\n}",
                solution: "function factorial(n) {\n    return n === 0 ? 1 : n * factorial(n - 1);\n}"
            }
        ];

        // Insert code blocks into the database
        await CodeBlock.deleteMany({}); // Clear old data
        await CodeBlock.insertMany(initialCodeBlocks);
        console.log('Initial code blocks inserted!');

        mongoose.connection.close(); // Close connection
    })
    .catch(err => console.error('MongoDB connection error:', err));
