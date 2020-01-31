exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'RanDumSocks',
  bot_version: '0.1.1',
  description: 'Displays broadcaster Discord link'
}

exports.cmdOptions = {
  command_cooldown: 10000,
}

exports.run = (argc, argv, userstate) => {
  this.RanDumBot.client.say(process.env.CHANNEL_NAME, 'Check out my Discord ' +
    'channel: https://discord.gg/WC5DQ24');
}