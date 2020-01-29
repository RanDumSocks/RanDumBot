exports.run = (argc, argv, userstate, RanDumBot) => {
  var minNum = 0;
  var maxNum = 100;
  if (argc == 3) {
    maxNum = parseInt(argv[2]);
    minNum = parseInt(argv[1]);
    if (minNum >= maxNum) { throw '!random: bad range given' }
  }
  RanDumBot.client.say(process.env.CHANNEL_NAME, (Math.floor(Math.random() * (maxNum - minNum)) + minNum + 1).toString());
}