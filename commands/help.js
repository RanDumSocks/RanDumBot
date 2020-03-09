exports.cmdInfo = {
  command_version: '1.2',
  command_author: 'RanDumSocks',
  bot_version: '0.2.0',
  command_arguments: [ 'command' ],
  description: 'Displays a list of avaliable commands. Can be used as ' +
               '"!help <command>" to view help for a specific command',
  aliases: ['h'],
};

exports.run = (argc, argv, userstate) => {
  if (argc == 1) { // List all commands
    var commandString = 'Commands: ';
    for (var i = 0; i < this.RanDumBot.commandMap.length; i += 1) {

      // Name match detection
      var cmdName = this.RanDumBot.commandMap[i][0];
      var cmdOrigName = this.RanDumBot.commandMap[i][1].data.name;
      var nameMatch = cmdName == cmdOrigName;

      // Permission detection
      var command = this.RanDumBot.commandMap[i][1];
      var badges = userstate.badges
      var isBroad = (badges ? userstate.badges.broadcaster : false);
      var isMod = userstate.mod;
      var permLevel = 0;
      if (isMod) permLevel = 1;
      if (isBroad) permLevel = 2;
      var permValid = command.cmdOptions.perm_level <= permLevel;

      if (nameMatch && permValid) commandString += '!' + cmdName + ', ';
    }

    this.RanDumBot.say(commandString);

  } else if (argc == 2) { // Info about specific command

    for (var i = 0; i < this.RanDumBot.commandMap.length; i += 1) {

      if (this.RanDumBot.commandMap[i][0] == argv[1]) {

        // Command variable definitions
        var command = this.RanDumBot.commandMap[i][1];
        var commandName = command.data.name;
        var commandArguments = command.cmdInfo.command_arguments;
        var commandAliases = command.cmdInfo.aliases;
        var commandNameFormat = '!' + commandName;

        // Permission detection
        var badges = userstate.badges
        var isBroad = (badges ? userstate.badges.broadcaster : false);
        var isMod = userstate.mod;
        var permLevel = 0;
        if (isMod) permLevel = 1;
        if (isBroad) permLevel = 2;
        var permValid = command.cmdOptions.perm_level <= permLevel;

        if (permValid) {
          for (var i = 0; i < commandAliases.length; i++) {
            commandNameFormat += `, !${commandAliases[i]}`;
          }

          for (var i = 0; i < commandArguments.length; i++) {
            commandNameFormat += ` <${commandArguments[i]}>`
          }

          this.RanDumBot.client.say(process.env.CHANNEL_NAME,
            commandNameFormat + ': ' + command.cmdInfo.description);
          break;
        }
      }
    }

  }
}