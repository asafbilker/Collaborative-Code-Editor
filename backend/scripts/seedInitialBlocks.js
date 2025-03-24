/**
 * Populates the database with 4 initial code blocks.
 * blocks can also be created manually via MongoDB Atlas as per assignment instructions
 */

require('dotenv').config(); // load env variables
const mongoose = require('mongoose'); // db connection
const CodeBlock = require('../models/CodeBlock'); // model for code block

// defined code blocks for seeding
const initialBlocks = [
  {
    title: 'Factorial Function',
    initialCode: `function factorial(n) {\n  // TODO: implement\n}`,
    solution: `function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}`,
    description: 'Implement a function that returns the factorial of a given number n.',
  },
  {
    title: 'Find Maximum',
    initialCode: `function findMax(arr) {\n  // TODO: implement\n}`,
    solution: `function findMax(arr) {\n  return Math.max(...arr);\n}`,
    description: 'Write a function that receives an array and returns its largest number.',
  },
  {
    title: 'Reverse String',
    initialCode: `function reverseString(str) {\n  // TODO: implement\n}`,
    solution: `function reverseString(str) {\n  return str.split('').reverse().join('');\n}`,
    description: 'Create a function that returns the reverse of a given string.',
  },
  {
    title: 'Check Prime',
    initialCode: `function isPrime(n) {\n  // TODO: implement\n}`,
    solution: `function isPrime(n) {\n  if (n <= 1) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}`,
    description: 'Build a function that checks whether a given number is a prime number.',
  },
];

mongoose
  .connect(process.env.MONGO_URI) // connect to mongo
  .then(async () => {
    console.log('Connected to DB');
    await CodeBlock.deleteMany({}); // clear old blocks
    console.log('Old blocks cleared');
    await CodeBlock.insertMany(initialBlocks); // insert new blocks
    console.log('Initial blocks inserted with descriptions');
    process.exit(0); // exit script
  })
  .catch((err) => {
    console.error('DB connection error:', err);
    process.exit(1);
  });
