exports.run = (argc, argv, userstate) => {
  if (argc == 1) {
    var commandString = 'Commands: ';
    for (var i = 0; i < this.RanDumBot.commandMap.length; i += 1) {
      commandString += '!' + this.RanDumBot.commandMap[i][0] + ', ';
    }
    this.RanDumBot.client.whisper(userstate.username, commandString);
  } else if (argc == 2) {
    for (var i = 0; i < this.RanDumBot.commandMap.length; i += 1) {
      if (this.RanDumBot.commandMap[i][0] == argv[1]) {
        this.RanDumBot.client.whisper(userstate.username,
                                 this.RanDumBot.commandMap[i][1].help());
        break;
      }
    }
  }
}

exports.help = () => {
  return '!help: Displays a list of avaliable commands. Can be used as ' +
         '"!help <command>" to view help for a specific command';
}