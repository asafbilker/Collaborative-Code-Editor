require('dotenv').config(); // load env variables
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// setup socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// tracking per room
const roomMentors = {}; // one mentor per room
const roomUsers = {}; // all connected users
const currentCode = {}; // code for each room

io.on('connection', (socket) => {

  socket.on('joinRoom', (id) => {
    if (!roomUsers[id]) roomUsers[id] = [];

    // remove disconnected users
    roomUsers[id] = roomUsers[id].filter((uid) => io.sockets.sockets.has(uid));
    if (roomMentors[id] && !io.sockets.sockets.has(roomMentors[id])) {
      delete roomMentors[id];
    }

    // add current socket to room
    if (!roomUsers[id].includes(socket.id)) {
      roomUsers[id].push(socket.id);
    }

    // assign roles: first is mentor
    if (!roomMentors[id]) {
      roomMentors[id] = socket.id;
      io.to(socket.id).emit('roleAssigned', 'Mentor');
    } else {
      io.to(socket.id).emit('roleAssigned', 'Student');
    }

    socket.join(id); // join socket room

    // sync latest code if exists
    if (currentCode[id]) {
      io.to(socket.id).emit('codeUpdate', currentCode[id]);
    }

    // show student count
    const studentCount = roomUsers[id].filter((uid) => uid !== roomMentors[id]).length;
    io.to(id).emit('updateStudentCount', studentCount);
  });

  socket.on('leaveRoom', (roomId) => {
    if (!roomUsers[roomId]) return;
  
    roomUsers[roomId] = roomUsers[roomId].filter((uid) => uid !== socket.id);
    const isMentor = roomMentors[roomId] === socket.id;
  
    if (isMentor) {
      delete roomMentors[roomId];

      // erase all students from room
      roomUsers[roomId].forEach((uid) => {
        io.to(uid).emit('mentorLeft');
      });

      delete roomUsers[roomId];
      delete currentCode[roomId];
    } else {
      // update remaining student count
      const studentCount = roomUsers[roomId].filter((uid) => uid !== roomMentors[roomId]).length;
      io.to(roomId).emit('updateStudentCount', studentCount);

      if (roomUsers[roomId].length === 0) {
        delete roomUsers[roomId];
        delete currentCode[roomId];
      }
    }
  });  

  // handle live code changes
  socket.on('codeChange', ({ id, newCode }) => {
    currentCode[id] = newCode;
    socket.to(id).emit('codeUpdate', newCode);
  });

  // handle disconnects
  socket.on('disconnect', () => {
    for (const roomId in roomUsers) {
      const users = roomUsers[roomId];
      const index = users.indexOf(socket.id);

      if (index !== -1) {
        users.splice(index, 1);

        if (roomMentors[roomId] === socket.id) {
          io.to(roomId).emit('mentorLeft');
          delete roomMentors[roomId];
          delete roomUsers[roomId];
          delete currentCode[roomId];
          return;
        }

        const studentCount = users.filter((uid) => uid !== roomMentors[roomId]).length;
        io.to(roomId).emit('updateStudentCount', studentCount);

        if (users.length === 0) {
          delete roomUsers[roomId];
          delete currentCode[roomId];
        }

        break;
      }
    }
  });
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running...');
});

// connect to mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use('/api/codeblocks', require('./routes/codeBlocks')); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
