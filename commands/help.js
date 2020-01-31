exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'RanDumSocks',
  bot_version: '0.1.1',
  command_arguments: [ 'command' ],
  description: 'Displays a list of avaliable commands. Can be used as ' +
               '"!help [command]" to view help for a specific command',
  aliases: ['h']
};

exports.run = (argc, argv, userstate) => {
  if (argc == 1) {
    var commandString = 'Commands: ';
    for (var i = 0; i < this.RanDumBot.commandMap.length; i += 1) {
      commandString += '!' + this.RanDumBot.commandMap[i][0] + ', ';
    }
    this.RanDumBot.client.say(process.env.CHANNEL_NAME, commandString);
  } else if (argc == 2) {
    for (var i = 0; i < this.RanDumBot.commandMap.length; i += 1) {
      if (this.RanDumBot.commandMap[i][0] == argv[1]) {
        var commandName = this.RanDumBot.commandMap[i][0];
        var command = this.RanDumBot.commandMap[i][1];
        var commandArguments = command.cmdInfo.command_arguments;
        var commandNameFormat = '!' + commandName;
        for (var i = 0; i < commandArguments.length; i++) {
          commandNameFormat += ` [${commandArguments[i]}]`
        }

        this.RanDumBot.client.say(process.env.CHANNEL_NAME,
          commandNameFormat + ': ' + command.cmdInfo.description);
        break;
      }
    }
  }
}