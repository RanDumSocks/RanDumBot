// Bot Version
const version = '0.1.1'

// Settings
const overlayPort = 8084;

// Packages
require('dotenv').config();
const http = require("http");
const url = require("url");  
const fs = require('fs');
const express = require('express');
const ios = require('socket.io');
const tmi = require('tmi.js');
const col = require('colors');
const eJson = require("edit-json-file");

// Create log file & directory
var d = new Date();
var logName = (`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}_${d.getHours()}${d.getMinutes()}${d.getSeconds()}`);
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

// Start webserver
var app = express()
var server = http.createServer(app);
var io = ios.listen(server);
server.listen(overlayPort);
app.use(express.static(__dirname));

// Set to true for all functions to be synchonous
var syncMode = false;

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
    this.debugMsg(`Thanks for using RanDumBot version (${version})`)
    ///////////////////
    // Load commands //
    ///////////////////
    var normalizedPath = require("path").join(__dirname, "commands");
    var commandMapBuild = [];
    require("fs").readdirSync(normalizedPath).forEach( (file) => {
      // Get command module & name
      var cmd = require("./commands/" + file);
      var cmdName = file.slice(0, file.length - 3);
      var altName = this.getCmdInfo(cmd, 'command_name');
      if (altName) { cmdName = altName };

      // Check command version against bot
      if (cmd.cmdInfo.bot_version != version) {
        this.debugMsg(`Version mismatch, command "${cmdName}" made for` +
                      ` version (${cmd.cmdInfo.bot_version})`, 'Error', col.red);
      }

      // Add command to bot
      commandMapBuild.push([cmdName, cmd]);
      cmd.data = new Object();
      cmd.RanDumBot = this;
      this.debugMsg(`Loaded command "${cmdName}" ` +
                    `version (${cmd.cmdInfo.command_version}) by ` +
                    `${cmd.cmdInfo.command_author}`);

      // Add aliases
      var aliases = cmd.cmdInfo.aliases;
      if (aliases) {
        for (var i = aliases.length - 1; i >= 0; i--) {
          cmdName = aliases[i];
          commandMapBuild.push([cmdName, cmd]);
        }
      }
    });
    this.private_commandMap = commandMapBuild;

    /////////////////
    // Setup tmijs //
    /////////////////
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
    this.client.on('part', (channel, username, self) =>
      {this.onPart(channel, username, self)});

    // Handle exit
    process.on('SIGINT', () => {
      syncMode = true;
      this.debugMsg('Shutting down...');
      this.debugMsg('Logging out all users...');
      // 'Leave' all current users
      for (var i = this.currentViewers.length - 1; i >= 0; i--) {
        this.userLeave(this.currentViewers[i]);
      }
      this.debugMsg('Exiting...');
      process.exit();
    });

    // Current viewers
    this.private_currViewers = []

    this.deltaTime = 0;
    this.lastTimeUpdate = Date.now();
    this.update();
    
    this.client.connect();
  }

  /**
   * See {@link https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#message|tmijs Events: Message}
   * @ignore
   */
  onMessage(channel, userstate, message, self) {
    if (self) {
      this.logMessage(message, 'BOT');
      return;
    }

    this.userJoin(userstate.username);

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
      this.userJoin(username);
    }
  }

  /**
   * See {@link https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#part|tmijs Events: Part}
   * @ignore
   */
  onPart(channel, username, self) {
    if (!self) {
      this.debugMsg(username + ' has left',
                    'Part',
                    col.yellow);
      this.userLeave(username);
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
   * Called when a user is seen on the channel in any way.
   * @ignore
   */
  userJoin(username) {
    var viewerIndex = (this.currentViewers.indexOf(username));
    if (viewerIndex == -1) {
      this.setUserData(username, 'last_time_update', Date.now());
      this.private_currViewers.push(username);
      this.debugMsg(username + ' has joined',
                    'Join',
                    col.green);
    }
  }

  /**
   * Called when a user leaves the channel or bot is shut down.
   * @ignore
   */
  userLeave(username) {
    var viewerIndex = (this.currentViewers.indexOf(username));
    if (viewerIndex != -1) {
      this.private_currViewers.splice(viewerIndex, 1);
      this.updateUserTime(username);
    } else {
      this.debugMsg('User left without joining', 'Error', col.red);
    }
  }

  /**
   * Updates a user's total time spent on the channel.
   * @ignore
   */
  updateUserTime(username) {
    try {
      var prevTime = parseInt(this.getUserData(username, 'total_time') || 0);
      var lastUpdate = parseInt(this.getUserData(username, 'last_time_update'));
      var currTime = Date.now().valueOf();
      this.setUserData(username, 'total_time', prevTime + (currTime - lastUpdate));
      this.setUserData(username, 'last_time_update', currTime);
    } catch (err) {
      this.debugMsg(err, 'Error', col.red);
    }
  }

  /**
   * Outputs message to the console.
   * @param {string} msg - message to output
   * @param {string} [info] - message tag
   * @param {object} [color] - color of the tag, see
   *   {@link https://www.npmjs.com/package/colors|Colors}
   * @param {boolean} [verbose] - only outputs if verbose logging is on,
   *   always saves to log file reguardless
   * @param {boolean} [sync] - Whether fline IO should be handled synchronously
   */
  debugMsg(msg, info = 'Info', color = col.gray, verbose = false, sync = syncMode) {
    // TODO: Implement verbose flag
    console.log('[' + color(info) + ']: ' + msg);
    // TODO: Add function to append files to log
    if (sync) {
      fs.appendFileSync(`./logs/${logName}.log`, '[' + info + ']: ' + msg + '\n', function (err) {
        if (err) throw err;
      });
    } else {
      fs.appendFile(`./logs/${logName}.log`, '[' + info + ']: ' + msg + '\n', function (err) {
        if (err) throw err;
      });
    }
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
          var cmd = this.commandMap[i][1];
          var lastUsed = cmd.data.last_used || 0;
          cmd.data.last_used = Date.now();
          var cmdCooldown = (cmd.cmdOptions ? cmd.cmdOptions.command_cooldown : 0) || 0;
          if (lastUsed + cmdCooldown <= Date.now()) {
            cmd.run(argc, argv, userstate);
          }
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

  update() {
    setTimeout(() => {
      this.update();
    }, 1000);
    this.deltaTime = Date.now() - this.lastTimeUpdate;
    this.lastTimeUpdate = Date.now();
  }

  /**
   * Sets user's data as a key, value pair.
   * @param {string} user - username of the data to set, NOT display name
   * @param {string} key - key to change
   * @param {*} value - value of the key
   */
  setUserData(user, key, value) {
    var userFile = eJson(`${__dirname}/data/userData.json`);
    userFile.set(`${user}.${key}`, value);
    userFile.save();
  }

  /**
   * Gets user's data value from given key.
   * @param {string} user - username of the data to set, NOT display name
   * @param {string} key - key to get value from
   * @return {string} value fetched from key
   */
  getUserData(user, key) {
    var userFile = eJson(`${__dirname}/data/userData.json`);
    return userFile.get(`${user}.${key}`);
  }

  getCmdInfo(cmd, key) {
    if (cmd.cmdInfo) {
      return cmd.cmdInfo[key]
    } else {
      return undefined;
    }
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

  /**
   * Array of current viewers on the channel
   */
  get currentViewers() {
    return this.private_currViewers;
  }

}

new RanDumBot();