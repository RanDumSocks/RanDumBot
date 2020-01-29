// Packages
require('dotenv').config()
const http = require("http");
const url = require("url");  
const fs = require('fs');
const express = require('express');
const ios = require('socket.io');
const tmi = require('tmi.js');
const col = require('colors');
const editJsonFile = require("edit-json-file");

// Create log file & directory
var d = new Date();
var logName = (`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}_${d.getHours()}${d.getMinutes()}${d.getSeconds()}`);
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');

// Start webserver
var app = express()
var server = http.createServer(app);
var io = ios.listen(server);
server.listen(8080);
app.use(express.static(__dirname));

/**
 * All purpose Twitch bot using tmijs.
 */
class RanDumBot {
  /**
   * Sets up tmijs client.
   * Must have valid environment variables.
   * See {@link https://github.com/RanDumSocks/RanDumBot/wiki#environment-variables|Environment Variables Setup}
   */
  constructor() {
    // Load commands
    var normalizedPath = require("path").join(__dirname, "commands");
    var commandMapBuild = [];
    require("fs").readdirSync(normalizedPath).forEach( (file) => {
      commandMapBuild.push([file.slice(0, file.length - 3),
                           require("./commands/" + file)]);
    });
    this.private_commandMap = commandMapBuild;

    const opts = {
      identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN,
      },
      channels: [
        process.env.CHANNEL_NAME,
      ]
    };

    this.private_client = new tmi.client(opts);

    // Client listeners
    this.client.on('message', (channel, userstate, message, self) =>
      {this.onMessage(channel, userstate, message, self)});
    this.client.on('connected', (addr, port) =>
      {this.onConnect(addr, port)});
    this.client.on('join', (channel, username, self) =>
      {this.onJoin(channel, username, self)});
    
    this.client.connect();
  }

  /**
   * See {@link https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#message|tmijs Events: Message}
   * @ignore
   */
  onMessage(channel, userstate, message, self) {
    if (self) {return;}

    if (message[0] == '!') {
      this.parseCommand(message.slice(1, message.length), userstate);
    } else {
      this.logMessage(message, userstate['display-name']);
    }
  }

  /**
   * See {@link https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#join|tmijs Events: Join}
   * @ignore
   */
  onJoin(channel, username, self) {
    if (!self) {
      this.debugMsg(username + ' has joined channel ' + channel.slice(1, channel.length),
                    'Join',
                    col.green);
    }
  }

  /**
   * See {@link https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#connect|tmijs Events: Connect}
   * @ignore
   */
  onConnect(addr, port) {
    this.debugMsg(`Connected to ${addr}:${port}`);
    this.debugMsg('Bot ' + process.env.BOT_USERNAME + ' running on channel ' +
                  process.env.CHANNEL_NAME);
  }

  /**
   * Outputs message to the console.
   * @param {string} msg - message to output
   * @param {string} [info] - message tag
   * @param {object} [color] - color of the tag, see
   *   {@link https://www.npmjs.com/package/colors|Colors}
   * @param {boolean} [verbose] - only outputs if verbose logging is on,
   *   always saves to log file reguardless
   */
  debugMsg(msg, info = 'Info', color = col.gray, verbose = false) {
    // TODO: Implement verbose flag
    console.log('[' + color(info) + ']: ' + msg);
    // TODO: Add function to append files to log
    fs.appendFile(`./logs/${logName}.log`, '[' + info + ']: ' + msg + '\n', function (err) {
      if (err) throw err;
    });
  }

  /**
   * Outputs user message to the console. Should not be called anywhere else,
   *   consider it a private function.
   * @param {string} msg - user message
   * @pram {string} user - name of user who sent the message
   * @ignore
   */
  logMessage(msg, user) {
    console.log(user.cyan + ': ' + msg);
    // TODO: Add function to append files to log
    fs.appendFile(`./logs/${logName}.log`, user + ': ' + msg + '\n', function (err) {
      if (err) throw err;
    });
    this.pushMessage(msg, user);
  }

  /**
   * Parses commands denoted by '!'. Runs appropriate command if exsts in
   *   commands folder. See
   *   {@link https://github.com/RanDumSocks/RanDumBot/wiki/Custom-Commands|Custom Commands}
   * @param {string[]} command - Array of command arguments
   * @param {object} userstate - Information on the user who sent the command
   * @ignore
   */
  parseCommand(command, userstate) {
    // TODO: Custom command denoter
    const argv = command.split(' ');
    const argc = argv.length;

    this.debugMsg(userstate.username + ': ' + argv, 'Command', col.blue)

    this.client.deletemessage(process.env.CHANNEL_NAME, userstate.id).catch((err) => {
      if (err == 'bad_delete_message_broadcaster') {
        // Ignore, cannot delete broadcaster messages
      } else {
        this.debugMsg(err, 'Error', col.red);
      }
    });

    for (var i = 0; i < this.commandMap.length; i += 1) {
      if (argv[0] == this.commandMap[i][0]) {
        try {
          this.commandMap[i][1].run(argc, argv, userstate, this);
        } catch (err) {
          this.debugMsg(err, 'Error', col.red);
        }
        break;
      }
    }
  }

  /**
   * Pushes message to the localhost client. Should not be called anywhere else,
   *   consider it a private function.
   * @ignore
   */
  pushMessage(msg, user) {
    io.emit('drawMessage', { user: user, msg: msg });
  }

  /**
   * A list of all avaliable commands and their functions in the form of
   *   [[commandName, [functions]], ...]
   */
  get commandMap() {
    return this.private_commandMap;
  }

  /**
   * The tmijs client object. See
   * {@link https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2|tmijs}
   * For full documentation
   */
  get client() {
    return this.private_client;
  }

}

new RanDumBot();