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
      username: process.env.BOT_USERNAME,
      password: process.env.OAUTH_TOKEN,
    },
    channels: [
      process.env.CHANNEL_NAME,
    ]
  };

  // Create a client with our options
  const client = new tmi.client(opts);
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.on('join', onJoinHandler);
  client.connect();

  function onMessageHandler(target, context, msg, self) {
    if (self) {return;}

    if (msg[0] == '!') {
      parseCommand(msg.slice(1, msg.length), context);
    } else {
      logMessage(msg, context.username);
    }
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler(addr, port) {
    debugMsg(`Connected to ${addr}:${port}`);
    debugMsg('Bot ' + col.cyan(process.env.BOT_USERNAME) + ' running on channel ' +
             col.cyan(process.env.CHANNEL_NAME));
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
    console.log(user.cyan + ': ' + msg);
    pushMessage(msg, user);
  }

  function parseCommand(command, context) {
    const argv = command.split(' ');
    const argc = argv.length;
    var argContext = 0;

    debugMsg(context.username + ': ' + argv, 'Command')

    client.deletemessage(process.env.CHANNEL_NAME, context.id).catch((err) => {
      debugMsg(err, 'Error', col.red)
    });

    try {
      switch(argv[0]) {
        case 'randum':
        case 'random':
          var minNum = 0;
          var maxNum = 100;
          if (argc == 3) {
            maxNum = parseInt(argv[2]);
            minNum = parseInt(argv[1]);
            if (minNum >= maxNum) { throw new Error('!random: bad range given') }
          }
          client.say(process.env.CHANNEL_NAME, (Math.floor(Math.random() * (maxNum - minNum)) + minNum + 1).toString());
          break;
        case 'help':
          if (argc == 2) {
            switch (argv[1]) {
              case 'random':
              case 'randum':
                client.whisper(context.username, '!random x y: Pick a random number between x and y. Default x = 0, y = 100');
                break;
            }
          } else {
            client.whisper(context.username, '!random');
          }
          break;
      }
    } catch (err) {
      debugMsg(err, 'Error', col.red);
    }
  }

  function pushMessage(msg, user) {
    io.emit('drawMessage', { user: user, msg: msg });
  }

}