**Documentation for RanDumBot v0.2.0**

RanDumBot is built off of [nodejs](https://nodejs.org/), so that means you should be familiar with programming in JavaScript. For the jsdocs of `RanDumBot.js`, see `/docs/RanDumBot.md`.

# Table of Contents
- [Bot Options](#bot-options)
  * [Option descriptions](#option-descriptions)
- [Commands](#commands)
  * [Command Members and Data](#command-members-and-data)
  * [Parameters](#parameters)
    + [Additional Notes](#additional-notes)
      - [argc & argv](#argc---argv)
      - [userstate](#userstate)
  * [cmdInfo](#cmdinfo)
  * [cmdOptions](#cmdoptions)
- [Timers](#timers)
  * [Timer Options](#timer-options)

# Bot Options
RanDumBot has a few options availiable to change. The default options are located in the `default_options.json` file in the root directory. It is recommended to *NOT* edit this file at all, instead create a new file called `options.json` in the same directory and overwrite the default options.

## Option descriptions
| Option Name | Type | Default Value | Description |
| --- | --- | --- | --- |
| overlay_port | `number` | `8080` | Port the overlay is hosted on. |
| open_chat | `boolean` | `false` | Whether to open a pop-out chat window of the channel the bot is running on in your default browser. Must be logged into the channel on Twitch. | 
| update_interval | `number` | `1000` | How often every timer's `update` function should run. |

# Commands
Creating a command is as easy as creating a `command_name.js` file in the `/commands` folder. All `.js` files here will be loaded into the bot when run. There is only one requirement for this file, which is a `run()` function that is called by the bot. It looks exactly like this:
```
exports.run = (argc, argv, userstate) => { }
```

## Command Members and Data
Each command has access to the bot's functions through the `this.RanDumBot` member.

Also, you have access to special maintained data for each command in the `this.data` object. Here are those and their purposes:

| Name | Type | Description |
| --- | --- | --- |
| last_run | `number` | Last time command was run |
| last_used | `number` | Last time command was used, may or may not have run accoring to `command_cooldown` in [cmdOptions](#cmdOptions) |
| times_run | `number` | Global number of times the command was run |
| is_alias | `boolean` | Whether the command is a copy/alias of another command |


## Parameters
| Parameter | Type | Description |
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

# Timers
Timers are different type of function that runs at a regular interval. These could be good for sending a message regularly to chat. All timers are located in the `/timers` folder and are named `<timer>.js`.

Each timer has a `run()` function just like commands, but this does not take in an parameters and it is just run once.

## Timer Options
These tell the timer how to behave. There should be an options object somewhere in your `<timer>.js` file that looks something like this:

```javascript
exports.options = {
  interval: 5000,
}
```

Here are all the availiable properties and their purposes:

| Property Name | Type | Default Value | Description |
| --- | --- | --- | --- |
| interval | `number` | `Number.MAX_VALUE` | Interval on how often this timer should run in milliseconds. If less than `options.update_interval`, will essentially run every time update function is called. |
