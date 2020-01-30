exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'RanDumSocks',
  bot_version: '0.1.1',
  description: 'Displays the github of this current project'
}

exports.run = (argc, argv, userstate) => {
  this.RanDumBot.client.say(process.env.CHANNEL_NAME, 'https://github.com/RanDumSocks/RanDumBot');
}