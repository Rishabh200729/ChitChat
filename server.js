//work to be done on line 28 in main.js
//work onj making sure that every msg is outputed to the dom 
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Msg = require("./models/message"); //require database model
const {
    formatMessage,
    formatchatMessage
} = require('./utils/messages');
const moment = require("moment");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'Chit Chatter';
// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({
        username,
        room
    }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        //send all the previos messages
        Msg.find({room:room}, (err, msgs) => {
            if (err) {
                console.log(err);
            } else {
                if (msgs) {
                    //welcome current user and display previous msgs
                    socket.emit('welcomeMsg', formatMessage(botName, {
                        welcomeMsg: 'Welcome to Chit Chat !',
                        userMsgs: msgs
                    }));
                }
            }
        })
        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('joiningMsg', formatMessage(botName, `${user.username} has joined the chat`));
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        const newMsg = new Msg({
            createdBy: user.username,
            msg,
            time: moment().format('h:mm a'),
            room:user.room
        }); //create a new chat message
        newMsg.save((err, doc) => {
            if (err) {
                console.log(err);
            } else {
                io.to(user.room).emit('chatMessage', user.username, doc.msg, doc.time, doc.room);
            }
        });
    });
    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('leavingMsg', formatMessage(botName, `${user.username} has left the chat`));
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));