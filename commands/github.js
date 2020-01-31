exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'RanDumSocks',
  bot_version: '0.1.1',
  description: 'Displays the github link of the bot (me!)'
}

exports.cmdOptions = {
  command_cooldown: 10000,
}

exports.run = (argc, argv, userstate) => {
  this.RanDumBot.client.say(process.env.CHANNEL_NAME, 'Think I (the bot) am ' + 
    'pretty cool? Check out my source code and use me! https://github.com/RanDumSocks/RanDumBot');
}