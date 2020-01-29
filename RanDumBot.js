require('dotenv').config()
var http = require("http");
var url = require("url");  
var fs = require('fs');
var express = require('express');
var ios = require('socket.io');
var tmi = require('tmi.js');
var col = require('colors');

// Create log file
var d = new Date();
var logName = (`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}_${d.getHours()}${d.getMinutes()}${d.getSeconds()}`);
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');

// Load Commands
var normalizedPath = require("path").join(__dirname, "commands");
var commandMap = [];
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  commandMap.push([file.slice(0, file.length - 3), require("./commands/" + file)]);
});

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
    debugMsg('Bot ' + process.env.BOT_USERNAME + ' running on channel ' +
             process.env.CHANNEL_NAME);
  }

  function onJoinHandler(channel, username, self) {
    if (!self) {
      debugMsg(username + ' has joined channel ' + channel.slice(1, channel.length),
               'Join',
               col.green);
    }
  }

  function debugMsg(msg, info = 'Info', color = col.gray) {
    console.log('[' + color(info) + ']: ' + msg);
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.appendFile(`./logs/${logName}.log`, '[' + info + ']: ' + msg + '\n', function (err) {
      if (err) throw err;
    });
  }

  function logMessage(msg, user) {
    console.log(user.cyan + ': ' + msg);
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.appendFile(`./logs/${logName}.log`, user + ': ' + msg + '\n', function (err) {
      if (err) throw err;
    });
    pushMessage(msg, user);
  }

  function parseCommand(command, context) {
    const argv = command.split(' ');
    const argc = argv.length;
    var argContext = 0;

    debugMsg(context.username + ': ' + argv, 'Command', col.blue)

    client.deletemessage(process.env.CHANNEL_NAME, context.id).catch((err) => {
      if (err == 'bad_delete_message_broadcaster') {
        // Ignore
      } else {
        debugMsg(err, 'Error', col.red);
      }
    });

    for (var i = 0; i < commandMap.length; i += 1) {
      if (argv[0] == commandMap[i][0]) {
        try {
          commandMap[i][1].run(argc, argv, client, context);
        } catch (err) {
          debugMsg(err, 'Error', col.red);
        }
        break;
      }
    }
  }

  function pushMessage(msg, user) {
    io.emit('drawMessage', { user: user, msg: msg });
  }

}