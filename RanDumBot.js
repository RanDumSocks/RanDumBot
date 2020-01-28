require('dotenv').config()
var http = require("http");
var url = require("url");  
var fs = require('fs');
var express = require('express');
var ios = require('socket.io');
var tmi = require('tmi.js');
var col = require('colors');

var app = express()

var server = http.createServer(app);
var io = ios.listen(server);
server.listen(8080);
app.use(express.static(__dirname));

startBot();

function startBot() {
  // Define configuration options
  const opts = {
    identity: {
      username: process.env.BOT_UNAME,
      password: process.env.BOT_OAUTH,
    },
    channels: [
      process.env.CHANNEL_UNAME,
    ]
  };

  // Create a client with our options
  const client = new tmi.client(opts);
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.on('join', onJoinHandler);
  client.connect();

  function onMessageHandler(target, context, msg, self) {

    if (msg[0] == '!') {
      parseCommand(msg.slice(1, msg.length));
    } else {
      logMessage(msg, target);
    }
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler(addr, port) {
    debugMsg(`Connected to ${addr}:${port}`);
    debugMsg('Bot ' + col.cyan(process.env.BOT_UNAME) + ' running on channel ' +
             col.cyan(process.env.CHANNEL_UNAME));
  }

  function onJoinHandler(channel, username, self) {
    if (!self) {
      debugMsg(username.green + ' has joined channel ' + channel.slice(1, channel.length),
               'Join',
               col.green);
    }
  }

  function debugMsg(msg, info = 'Info', color = col.gray) {
    console.log('[' + color(info) + ']: ' + msg);
  }

  function logMessage(msg, user) {
    console.log(user.slice(1, user.length).blue + ': ' + msg);
    pushMessage(msg, user);
  }

  function parseCommand(command) {
    const argv = command.split(' ');
    const argc = argv.length;

    debugMsg(argv[0], 'Command');
  }

  function pushMessage(msg, user) {
    io.emit('drawMessage', { user: user, msg: msg });
  }
}