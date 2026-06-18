const express = require('express');
const app = express();
const http = require('http');

const socketIo = require('socket.io');

const server = http.createServer(app);

const io = socketIo(server);

app.set('view engine', 'ejs');
app.set(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(3000 , () => {
    console.log('Server is running on port 3000');
});
 
