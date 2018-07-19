const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib');
const tokenLib = require('./tokenLib');
const check = require('./checkLib');
const response = require('./responseLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();

let setServer = (server) => {
    let allOnlineUsers = [];

    let io = socketio.listen(server);

    let myIo = io.of('');

    // whenever we want to do cross soccket communication we use io (or myIo) 
    // because socket is our pipe and from our pipe (i.e socket) we emit it on 
    // myIo that can be assumed to be collection of pipe 

    // an observation these sockets are pipe from client to server


    myIo.on('connection', (socket) => {
        console.log('on connection -- emitting verify user');
        // this socket will emit this event and whoever 
        // connects wiht this socket will get this event
        let onConnectionData = {
            message: 'Socket Connected',
        }
        socket.emit('verifyUser', onConnectionData);
        
        // this event was emitted from the client side
        // now it is upto socket what to do
        //socket room id and name will be send by user along with authToken
        socket.on('setUser', (data) => {
            console.log('setUser called' + data);
            let authToken = data.authToken;
            let userId = data.userId;
           
            tokenLib.verifyClaimWithoutSecret(data.authToken, (err, user) => {
                if (err) {
                    socket.emit("errorEvent", "Auth Error! PLease Login Again!");
                    socket.disconnect(true);
                } else {
                    console.log('user is verified -setting details');
                    let currentUser = user.data;
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`;
                    console.log('full name is ' + fullName);
                    //setting socket user id
                    //now this is where the socket gets identity
                    // if socket already has userId then no need to set it
                    //---- find fix for multiple user adding to online user list
                    socket.userId = userId;
                    socket.name = fullName;
                    let userObj = { userId: currentUser.userId, fullName: fullName };
                    allOnlineUsers.push(userObj);
                    console.log(allOnlineUsers);
                    //-- as this will be execued for every user therefore all user will join same room
                    // setting room name
                    socket.room = "UNIVERSAL ROOM";
                    //joining chat room
                    socket.join(socket.room);
                    console.log('joined chat room ' + socket.room);
                    let obj = {
                        message: 'join',
                        sendBy: fullName,
                        list: allOnlineUsers
                    }
                    socket.to(socket.room).broadcast.emit('onlineUserList', obj);

                    let data = {
                        socketId : socket.userId,
                        socketName : socket.name,
                        roomName : socket.room,
                    }
                    socket.emit("userSet", data);
                }
            });
            
        });

        //-- broadcast message listener
        socket.on('broadcastMessage', (data) => {
            // data = {
            //     userId : userId,
            //     message : message,
            //     broadcastMessageBy : broadcastMessageBy
            // }
            console.log(data);
            console.log("broad cast message send by " + data.broadcastMessageBy + "to " + socket.room);
            socket.to(socket.room).broadcast.emit('broadcastMessage', data);
        });
        //-- end broadcast message listener

        //listen change event, commit change and add to change log
        socket.on('disconnect', () => {
            //disconnecct the user from the socket
            // remove the user from online list
            // unsubscribe the user from his own channel

            console.log('user is disconnected');
            console.log(socket.userId);

            var removeIndex = allOnlineUsers.map(function (user) { return user.userId; }).indexOf(socket.userId);
            allOnlineUsers.splice(removeIndex, 1);
            console.log(allOnlineUsers);

            let obj = {
                message: 'left',
                sendBy: socket.name,
                list: allOnlineUsers
            }
            socket.to(socket.room).broadcast.emit('onlineUserList', obj);
            socket.leave(socket.room);
            // socketId : socket.userId,
            // socketName : socket.name,
            // roomName : socket.room,
        });

    });
}





module.exports = {
    setServer: setServer
}

// observations
// socket.emit('error',"message");
//here the emit error event is something taht is inbuilt event and needs to be handled
// so create your own event so that server does not crash