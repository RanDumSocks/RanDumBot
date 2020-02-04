RanDumBot is built off of [nodejs](https://nodejs.org/), so that means you should be familiar with programming in JavaScript.

# Adding a Command
Creating a command is as easy as creating a `command_name.js` file in the `./commands` folder. All `.js` files here will be loaded into the bot when run. There is only one requirement for this file, which is a `run()` function that is called by the bot. It looks exactly like this:
```
exports.run = (argc, argv, userstate) => { }
```
And that's it! Keep reading to learn what the parameters are and what functions you have access to.

## Parameters
| Param | Type | Description |
| --- | --- | --- |
| argc | `number` | number of arguments passed into the function. | Example: someone sends `!help`, argc is 1. `!help uptime` would mean argc is 2. |
| argv | `string[]` | array of arguments passed, space delimited | Example: Someone sends `!random 5 10`, argv would be the array `["random", "5", "10"].` |
| userstate | `object` | information about the message sent |

### Additional Notes
#### argc & argv
Examples:

| Message Sent | argc | argv |
| --- | --- | --- |
| !help | `1` | `["help"]` |
| !random 5 10 | `3` | `["random", "5", "10"]` |
#### userstate
This contains a lot of useful information about the user who sent the message. Here is an example of what one would look like:
```javascript
{
  'badge-info': null,
  badges: { broadcaster: '1' },
  color: '#44FF23',
  'display-name': 'RanDumSocks',
  emotes: null,
  flags: null,
  id: '6238a003-7d7c-4731-9d93-2eb6cab64ba0',
  mod: false,
  'room-id': '92167984',
  subscriber: false,
  'tmi-sent-ts': '1580502893602',
  turbo: false,
  'user-id': '92167984',
  'user-type': null,
  'emotes-raw': null,
  'badge-info-raw': null,
  'badges-raw': 'broadcaster/1',
  username: 'randumsocks',
  'message-type': 'chat'
}
```