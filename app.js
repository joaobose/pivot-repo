const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const NodeRSA = require('node-rsa');
const secretKey = new NodeRSA({b: 1024}); 


io.on('connection',(socket)=>{

    socket.on('join-mock',(data)=>{
        let name = data.name;
        let phoneNumber = data.phone;
        let type = data.type;

        if (['C','B'].includes(type)){
            // join to cypher
            socket.join('cypher');
        }
        else if (['A','D'].includes(type)){
            // join to plain
            socket.join('plain');
        }
    });

    socket.on('chat-message',(data)=>{
        let name = data.name;
        let phoneNumber = data.phone;
        let type = data.type;
        let message = data.text;
        let date = Date.now();

        let plainData = {
            name: name,
            phone: phoneNumber,
            text: message,
            type: type
        };

        let cypherMesage = secretKey.encrypt(message, 'base64');

        let cypherData = {
            name: name,
            phone: phoneNumber,
            text: cypherMesage,
            type: type
        };

        // only A and D can send data
        if (['A','D'].includes(type)){
            io.to('plain').emit('chat-message',plainData);
            io.to('cypher').emit('chat-message',cypherData);
        }

        
    });

    socket.on('disconnect',(data)=>{
        console.log('socket disconnected')
    });

});


// turning on the server
server.listen(8099,()=>{
    console.log('Tamosi-chat backend service started in port 8099');
});