require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const roomMentors = {};
const roomUsers = {};
const currentCode = {};

io.on('connection', (socket) => {
    console.log(`🧩 A user connected: ${socket.id}`);

    socket.on('joinRoom', (id) => {
        console.log(`💥 joinRoom START | socket: ${socket.id} | room: ${id}`);

        if (!roomUsers[id]) roomUsers[id] = [];

        // 🧹 Clean ghost users
        roomUsers[id] = roomUsers[id].filter(uid => io.sockets.sockets.has(uid));
        if (roomMentors[id] && !io.sockets.sockets.has(roomMentors[id])) {
            console.log(`🧹 Removed stale mentor ${roomMentors[id]} from room ${id}`);
            delete roomMentors[id];
        }

        // 🧪 TEMP: Force reset if no mentor but users still exist
        if (!roomMentors[id] && roomUsers[id].length > 0) {
            console.log(`🔁 No mentor but users exist. Kicking everyone from room ${id}`);
            roomUsers[id].forEach(uid => io.to(uid).emit('mentorLeft'));
            roomUsers[id] = [];
        }

        if (!roomUsers[id].includes(socket.id)) {
            roomUsers[id].push(socket.id);
        }

        // 🧠 Assign role
        if (!roomMentors[id]) {
            roomMentors[id] = socket.id;
            io.to(socket.id).emit('roleAssigned', 'Mentor');
            console.log(`🧠 FINAL Role assigned to this user: Mentor`);
        } else {
            io.to(socket.id).emit('roleAssigned', 'Student');
            console.log(`🧠 FINAL Role assigned to this user: Student`);
        }

        socket.join(id);

        console.log('🔍 AFTER JOIN:', {
            roomUsers: roomUsers[id],
            roomMentor: roomMentors[id],
            currentCode: currentCode[id],
        });

        if (currentCode[id]) {
            io.to(socket.id).emit('codeUpdate', currentCode[id]);
        }

        const studentCount = roomUsers[id].filter(uid => uid !== roomMentors[id]).length;
        io.to(id).emit('updateStudentCount', studentCount);
    });

    socket.on('leaveRoom', (roomId) => {
        console.log(`🚪 leaveRoom received from ${socket.id} for room ${roomId}`);
        if (roomUsers[roomId]) {
            roomUsers[roomId] = roomUsers[roomId].filter(uid => uid !== socket.id);

            if (roomMentors[roomId] === socket.id) {
                delete roomMentors[roomId];
                console.log(`🧹 Mentor ${socket.id} removed from room ${roomId}`);
            }

            if (roomUsers[roomId].length === 0) {
                console.log(`🧼 Room ${roomId} now empty. Cleaning up.`);
                delete roomUsers[roomId];
                delete currentCode[roomId];
            }
        }
    });

    socket.on('codeChange', ({ id, newCode }) => {
        currentCode[id] = newCode;
        socket.to(id).emit('codeUpdate', newCode);
    });

    socket.on('disconnect', () => {
        console.log(`❌ User ${socket.id} disconnected`);

        for (const roomId in roomUsers) {
            const users = roomUsers[roomId];
            const index = users.indexOf(socket.id);

            if (index !== -1) {
                users.splice(index, 1);

                if (roomMentors[roomId] === socket.id) {
                    console.log(`⚠️ Mentor left room ${roomId}. Kicking all users and resetting room...`);
                    io.to(roomId).emit('mentorLeft');
                    delete roomMentors[roomId];
                    delete roomUsers[roomId];
                    delete currentCode[roomId];
                    return;
                }

                const studentCount = users.filter(uid => uid !== roomMentors[roomId]).length;
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

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        console.log('🧾 Database name:', mongoose.connection.db.databaseName);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
    });

app.use('/api/codeblocks', require('./routes/codeBlocks'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
