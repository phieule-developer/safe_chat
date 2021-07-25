const express = require('express');
const app = express();

const server = require('http').createServer(app);
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/safe_chat',{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("connection success"))
.catch(()=>console.log("connection error"));
require('dotenv').config();

app.use(require('./api/routers/router'));
global.io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is listening on *:${PORT}`);
});

global.client = {};
const {socket,sendReportToUser} = require('./helper/socketIO');
socket(io);

// const crypto = require('crypto');
// const alice = crypto.getDiffieHellman('modp15');
// const bob = crypto.getDiffieHellman('modp15');

// alice.generateKeys();
// bob.generateKeys();

// console.log(alice.getPrivateKey('hex'));
// const aliceSecret = alice.computeSecret(bob.getPublicKey(),null,'hex');
// const bobSecret = bob.computeSecret(alice.getPublicKey(),null,'hex');

// console.log(aliceSecret);
// console.log(bobSecret);

