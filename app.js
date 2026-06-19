const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Track connected users count
let connectedUsers = 0;

io.on('connection', function (socket) {
    connectedUsers++;
    io.emit('user-count', connectedUsers);

    socket.on('send-location', function (data) {
        io.emit('receive-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', function () {
        connectedUsers = Math.max(0, connectedUsers - 1);
        io.emit('user-count', connectedUsers);
        io.emit('user-disconnected', socket.id);
    });
});

// Landing page
app.get('/', function (req, res) {
    res.render('landing');
});

// Tracker app
app.get('/tracker', function (req, res) {
    res.render('index');
});

// 404 handler
app.use(function (req, res) {
    res.redirect('/');
});

server.listen(3000, function () {
    console.log('🌍 TrackSphere running at http://localhost:3000');
});
