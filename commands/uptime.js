exports.run = (argc, argv, userstate, RanDumBot) => {
  RanDumBot.client.api({
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
      RanDumBot.client.say(process.env.CHANNEL_NAME, `Streaming for ${hours} hours, ${minutes} minutes, ${seconds} seconds`)
    } else {
      RanDumBot.client.say(process.env.CHANNEL_NAME, 'I am currently not streaming!')
    }
  });
}