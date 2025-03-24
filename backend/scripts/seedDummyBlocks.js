require('dotenv').config();
const mongoose = require('mongoose');
const CodeBlock = require('../models/CodeBlock'); // path is correct now

const dummyBlocks = Array.from({ length: 80 }, (_, i) => ({
  title: `Dummy Block ${i + 1}`,
  initialCode: `// Code block ${i + 1} starter code`,
  solution: `// Code block ${i + 1} solution`,
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB ✅');

    await CodeBlock.deleteMany({});
    console.log('🧹 Old blocks cleared');

    await CodeBlock.insertMany(dummyBlocks);
    console.log('✅ Dummy blocks inserted!');

    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  });
