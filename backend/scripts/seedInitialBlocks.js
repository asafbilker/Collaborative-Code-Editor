/**
 * Populates the database with 4 initial code blocks.
 * Blocks can also be created manually via MongoDB Atlas as per assignment instructions.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const CodeBlock = require('../models/CodeBlock');

const initialBlocks = [
  {
    title: 'Factorial Function',
    initialCode: `function factorial(n) {\n  // TODO: implement\n}`,
    solution: `function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}`,
  },
  {
    title: 'Find Maximum',
    initialCode: `function findMax(arr) {\n  // TODO: implement\n}`,
    solution: `function findMax(arr) {\n  return Math.max(...arr);\n}`,
  },
  {
    title: 'Reverse String',
    initialCode: `function reverseString(str) {\n  // TODO: implement\n}`,
    solution: `function reverseString(str) {\n  return str.split('').reverse().join('');\n}`,
  },
  {
    title: 'Check Prime',
    initialCode: `function isPrime(n) {\n  // TODO: implement\n}`,
    solution: `function isPrime(n) {\n  if (n <= 1) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}`,
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to DB');
    await CodeBlock.deleteMany({});
    console.log('🧹 Old blocks cleared');
    await CodeBlock.insertMany(initialBlocks);
    console.log('✅ Initial blocks inserted!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });
