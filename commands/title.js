exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'RanDumSocks',
  bot_version: '0.2.1',
  description: 'Updates the title of the stream',
};

exports.cmdOptions = {
  perm_level: 1
}

exports.run = (argc, argv, userstate) => {
  argv.shift();
  this.RanDumBot.updateChannel({status: argv.join(" ")}, userstate['room-id']);
}