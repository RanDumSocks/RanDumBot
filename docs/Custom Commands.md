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
## cmdInfo
Each command has a `cmdInfo` object which tells RanDumBot more information about the command to help with loading. By default, everything is set to `undefined`. You can technically load a command without `cmdInfo` just fine, however you may get some warnings. This should be located somewhere in your `<command>.js` file and looks something like this:
```javascript
exports.cmdInfo = {
  command_version: '1.0',
  command_author: 'me',
  bot_version: '0.1.2',
  description: 'This is a description
};
```
Here are all the availiable properties and their purposes:

| Property Name | Type | Description |
| --- | --- | --- |
| command_version | `string` | Version of this command. Not used anywhere except displaying in the console when command is loaded. |
| command_author | `string` | Name of the creator of the command. Not used anywhere except displaying in the console when command is loaded. |
| bot_version | `string` | Version of RanDumBot this command was created for. If this is mismatched from the bot version it is running on, a warning will display upon load. |
| command_arguments | `string[]` | If a command takes in arguments from the user, the argument titles should be listed here. This is used in the default 'help' command to display a command's arguments. |
| command_name | `string` | The name used to call this command. By default, commands are given the name of the `.js` file. This overwrites that name. |
| description | `string` | Description of the usage of this command. Used in the default 'help' command to display the description. |
| aliases | `string[]` | A list of other names for this command. Calling any one of these, including the command's name, will  call this command. |

## cmdOptions
Same setup as `cmdInfo`, however these affect the behavior of the command itself.

| Property Name | Type | Default | Description |
| --- | --- | --- | --- |
| command_cooldown | `number` | `0` | Measured in milliseconds, time before this command can be used again by anyone. |
