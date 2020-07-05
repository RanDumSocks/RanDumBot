// Bot Version
const version = '0.2.1'

// Packages
require('dotenv').config();
const http      = require("http");
const url       = require("url");  
const fs        = require('fs');
const express   = require('express');
const ios       = require('socket.io');
const tmi       = require('tmi.js');
const col       = require('colors');
const eJson     = require("edit-json-file");
const opn       = require('opn');

// Load settings
var defaultOptionsFile = eJson(`${__dirname}/default_options.json`);
var userOptionsFile = eJson(`${__dirname}/options.json`);
var options = {...defaultOptionsFile.toObject(), ...userOptionsFile.toObject()};

var overlayPort = options.overlay_port;

// Create log file & directory
var d = new Date();
var logName = (`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}_${d.getHours()}${d.getMinutes()}${d.getSeconds()}`);
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync('./timers')) fs.mkdirSync('./timers');

// Default command objects
var default_cmdInfo = {
  command_version: undefined,
  command_author: undefined,
  bot_version: undefined,
  command_arguments: undefined,
  command_name: undefined,
  description: undefined,
  aliases: undefined
};

var default_cmdOptions = {
  command_cooldown: 0,
  perm_level: 0
}

// Default timer objects
var default_timerOptions = {
  interval: Number.MAX_VALUE,
}

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
    // padding used for flush debug output 
    // Magic number 7 for [Command] tag
    this.debugInfoPadding = 7   

    this.debugMsg(`Thanks for using RanDumBot version (${version})`);
    this.debugMsg(`Check out the developer's discord: https://discord.gg/WC5DQ24`);

    ///////////////////
    // Load commands //
    ///////////////////
    var normalizedPath = require("path").join(__dirname, "commands");
    var commandMapBuild = [];
    require("fs").readdirSync(normalizedPath).forEach( (file) => {
      // Get command module & name
      var cmd = require("./commands/" + file);
      var cmdName = file.slice(0, file.length - 3);

      // Set defaults
      cmd.cmdInfo = {...default_cmdInfo, ...cmd.cmdInfo};
      cmd.cmdOptions = {...default_cmdOptions, ...cmd.cmdOptions};

      // Update commandName
      var altName = cmd.cmdInfo.command_name;
      if (altName) { cmdName = altName };

      // Check command version against bot
      if (cmd.cmdInfo.bot_version != version) {
        this.debugMsg(`Version mismatch, command "${cmdName}" made for` +
                      ` version (${cmd.cmdInfo.bot_version})`, 'Warn', col.yellow);
      }

      // Add members to command
      cmd.data = new Object();
      cmd.data.last_run = 0;
      cmd.data.times_run = 0;
      cmd.data.name = cmdName;
      cmd.RanDumBot = this;

      // Add command to bot
      commandMapBuild.push([cmdName, cmd]);
      this.debugMsg(`Loaded command "${cmdName}" ` +
                    `version (${cmd.cmdInfo.command_version}) by ` +
                    `${cmd.cmdInfo.command_author}`);

      // Sort commands alphabetically
      commandMapBuild.sort( (a, b) => { return a[0].localeCompare(b[0]) });

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
    // Load Timers //
    /////////////////
    var normalizedPath = require("path").join(__dirname, "timers");
    var timerMapBuild = [];
    require("fs").readdirSync(normalizedPath).forEach( (file) => {
      var timer = require("./timers/" + file);
      timer.options = {...default_timerOptions, ...timer.options};
      timer.update = timerUpdate;
      timer.data = new Object();
      timer.data.lastCall = Date.now();
      timer.data.counter = 0;
      timer.RanDumBot = this;
      timerMapBuild.push(timer);
    });
    this.private_timerMap = timerMapBuild;

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
    this.client.on('chat', (channel, userstate, message, self) =>
      {this.onChat(channel, userstate, message, self)});
    this.client.on('connected', (addr, port) =>
      {this.onConnect(addr, port)});
    this.client.on('join', (channel, username, self) =>
      {this.onJoin(channel, username, self)});
    this.client.on('part', (channel, username, self) =>
      {this.onPart(channel, username, self)});

    // Misc setup
    if (options.open_chat) opn(`https://dashboard.twitch.tv/popout/u/` +
                               `${process.env.CHANNEL_NAME}` +
                               `/stream-manager/chat`);

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

    // Timer setup
    this.deltaTime = 0;
    this.lastTimeUpdate = Date.now();
    this.update();
    
    // Connect
    this.client.connect();
  }

  /**
   * See {@link https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#message|tmijs Events: Message}
   * @ignore
   */
  onChat(channel, userstate, message, self) {
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
   * Gets a user's total watchtime on the channel.
   * @param  {string} username username of watchtime to get
   * @return {number}          total watchtime in milliseconds
   */
  getUserWatchtime(username) {
    this.updateUserTime(username);
    return this.getUserData(username, 'total_time');
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
    // automatic padding
    this.debugInfoPadding = info.length > this.debugInfoPadding ? info.length : this.debugInfoPadding
    var padding = this.debugInfoPadding - info.length

    // TODO: Implement verbose flag
    console.log(`[${color(info)}]${" ".repeat(padding)} │ ${msg}`)
    // TODO: Add function to append files to log
    var logText = `[${info}]${" ".repeat(padding)} │ ${msg}\n`.replace(/.{3}m/, "")
    if (sync) {
      fs.appendFileSync(`./logs/${logName}.log`, logText, function (err) {
        if (err) throw err;
      });
    } else {
      fs.appendFile(`./logs/${logName}.log`, logText, function (err) {
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

    if (options.delete_command) {
      this.client.deletemessage(process.env.CHANNEL_NAME, userstate.id).catch((err) => {
        if (err == 'bad_delete_message_broadcaster') {
          // Ignore, cannot delete broadcaster messages
        } else {
          this.debugMsg(err, 'Error', col.red);
        }
      });
    }

    for (var i = 0; i < this.commandMap.length; i += 1) {
      if (argv[0] == this.commandMap[i][0]) {
        try {

          // Cooldown detection
          var cmd = this.commandMap[i][1];
          var lastUsed = cmd.data.last_used || 0;
          var cmdCooldown = (cmd.cmdOptions ? cmd.cmdOptions.command_cooldown : 0) || 0;
          var cooldownValid = lastUsed + cmdCooldown <= Date.now();

          // Permission detection
          var badges = userstate.badges
          var isBroad = (badges ? (userstate.badges.broadcaster != null) : false);
          var isMod = userstate.mod;
          var permLevel = 0;
          if (isMod) permLevel = 1;
          if (isBroad) permLevel = 2;
          var permValid = cmd.cmdOptions.perm_level <= permLevel;

          if (cooldownValid && permValid) {
            cmd.data.last_used = Date.now();
            cmd.data.last_run = Date.now();
            cmd.data.times_run += 1;
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

  /**
   * Continuous bot update function. Runs at a regular interval accoring to the
   * `update_interval` option
   */
  update() {
    setTimeout(() => {
      this.update();
    }, options.update_interval);

    try {
      for (var i = this.private_timerMap.length - 1; i >= 0; i--) {
        this.private_timerMap[i].update();
      }
    } catch (err) {
      this.debugMsg(err, 'Error', col.red);
    }
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

  /**
   * Send a message to chat.
   * @param  {string} msg message to send
   */
  say(msg) {
    this.client.say(process.env.CHANNEL_NAME, msg);
  }

  /**
   * Updates the given channel with the params given, specified by the [Twitch
   * API](https://dev.twitch.tv/docs/v5/reference/channels/#update-channel). Bot
   * must have editor access to the channel.
   * @param  {object} params    parameters to send
   * @param  {string} channelId ID of channel to update
   */
  updateChannel(params, channelId) {
    this.client.api({
      url: `https://api.twitch.tv/kraken/channels/${channelId}`,
      method: 'PUT',
      json: {
        channel: params
      },
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Authorization': `OAuth ${process.env.OAUTH_TOKEN.replace("oauth:", "")}`
      }
    }, (err, res, body) => {
      if (err) this.debugMsg(err, 'Error', col.red)
    });
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

/**
 * Default update function for timers. This gets called every update tick for
 * each timer. Can be overridden, but may have unexpected results. Is named
 * update() in timer functions. Calls the run() function once the interval
 * threshold has been reached.
 * @ignore
 */
function timerUpdate() {
  var deltaTime = Date.now() - this.data.lastCall;
  this.data.lastCall = Date.now();

  this.data.counter += deltaTime;

  if (this.data.counter >= this.options.interval) {
    this.data.counter -= this.options.interval;
    this.run();
  }
}

new RanDumBot();