exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'RanDumSocks',
  bot_version: '0.1.1',
  command_arguments: [ 'x', 'y' ],
  description: 'Picks a random number between x & y. ' +
               'Default values are x=0, y=100'
}

exports.run = (argc, argv, userstate) => {
  var minNum = 0;
  var maxNum = 100;
  if (argc == 3) {
    maxNum = parseInt(argv[2]);
    minNum = parseInt(argv[1]);
    if (minNum >= maxNum) { throw '!random: bad range given' }
  }
  this.RanDumBot.client.say(process.env.CHANNEL_NAME, (Math.floor(Math.random() * (maxNum - minNum)) + minNum + 1).toString());
}