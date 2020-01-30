# RanDumBot
Simple, fully customizable Twitch bot using nodejs and tmijs.
Documentation is a WIP, very bare bones at the moment.

## Installation Instructions
This bot uses your own Twitch account as the bot itself. It is recommended you create a new account for the bot on Twitch. This will be inportant for setting-up your environment variables.
### Windows
1. Download & install the latest LTS version of [nodejs](https://nodejs.org/en/).
2. Download & install the latest stable version of [Yarn](https://legacy.yarnpkg.com/en/).
3. Clone *or* download the bot via the [releases](https://github.com/RanDumSocks/RanDumBot/releases) somewhere on your machine.
4. Within the RanDumBot folder, open up your preferred terminal.
    - Shift right-click inside the folder and choose "Open PowerShell window here" or "Open command window here"
5. Enter `yarn` to install required dependencies
6. Set up appropriate [environment varibles](https://github.com/RanDumSocks/RanDumBot#setting-up-environment-variables).
7. Start the bot with the command `node RanDumBot.js`. All done!
### Setting-Up Environment Variables
In order to have the bot connect to the Twitch API, you must have valid credentials stored inside of the RanDumBot folder within the `.env` file.

1. Create a new file valled `.env` in the RanDumBot folder.
2. Open up the file and type the lines:
```
BOT_USERNAME=<bot>
CHANNEL_NAME=<user>
```
Where `<bot>` is the username of the bot on Twitch and `<user>` is the username of the channel you want the bot to work on, probably your own Twitch account.

3. [Generate an OAuth token](https://twitchapps.com/tmi/) with your *bot* account and create a new line in the `.env` folder that looks like `OAUTH_TOKEN=<token>` where `<token>` is the generated OAuth token from the website.
4. Got to [Twitch developers website](https://dev.twitch.tv/) and login.
    - Once logged in, navigate to your [applications tab](https://dev.twitch.tv/console/apps) and select 'Register Your Application'
    - Name your application anything you want
    - Set the 'OAuth Redirect URLs' to `http://localhost`
    - Select 'Chat Bot' for the category
    - Click 'Create'
5. Go back to your [applications tab](https://dev.twitch.tv/console/apps) and select 'Manage' on the application you just created.
6. Copy the 'Client ID' and create a new line in the `.env` file that looks like `CLIENT_ID=<id>` where `<id>` is the Client ID you just copied.

In the end, your `.env` file should look like this:
```
OAUTH_TOKEN=oauth:dxeyzl2p5lw1dqgqsvh3rdyab145cn
BOT_USERNAME=randumbot
CHANNEL_NAME=randumsocks
CLIENT_ID=m1r6hjh1pjckkayuw4shiyeh8sa4rh
```
Save that and you should be good to go!
### Troubleshooting
Something not going right? [Submit an issue](https://github.com/RanDumSocks/RanDumBot/issues/new) and describe what went wrong and you will get help as soon as possible.
