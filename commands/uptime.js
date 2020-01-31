exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'RanDumSocks',
  bot_version: '0.1.1',
  description: 'Displays the uptime of the current steam'
}

exports.cmdOptions = {
  command_timeout: 10000,
}

exports.run = (argc, argv, userstate) => {
  this.RanDumBot.client.api({
    url: `https://api.twitch.tv/helix/streams?user_login=${process.env.CHANNEL_NAME}`,
    method: 'GET',
    headers: {
      'Client-ID': process.env.CLIENT_ID
    }
  }, (err, res, body) => {
    if (body.data[0] != undefined) {
      var startTime = Date.parse(body.data[0].started_at);
      var timeDiff = new Date(Date.now() - startTime);
      var hours = timeDiff.getUTCHours();
      var minutes = timeDiff.getUTCMinutes();
      var seconds = timeDiff.getUTCSeconds();
      this.RanDumBot.client.say(process.env.CHANNEL_NAME, `Streaming for ${hours} hours, ${minutes} minutes, ${seconds} seconds`)
    } else {
      this.RanDumBot.client.say(process.env.CHANNEL_NAME, 'I am currently not streaming!')
    }
  });
}

exports.help = () => {
  return '!uptime: Says current uptime of the stream';
}