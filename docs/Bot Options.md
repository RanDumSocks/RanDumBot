### For RanDumBot v0.2.0
RanDumBot has a few options availiable to change. The default options are located in the `default_options.json` file in the root directory. It is recommended to *NOT* edit this file at all, instead create a new file called `options.json` in the same directory and overwrite the default options.
## Option descriptions
| Option Name | Type | Default Value | Description |
| --- | --- | --- | --- |
| overlay_port | `number` | `8080` | Port the overlay is hosted on. |
| open_chat | `boolean` | `false` | Whether to open a pop-out chat window of the channel the bot is running on in your default browser. Must be logged into the channel on Twitch. | 
| update_interval | `number` | `1000` | How often every timer's `update` function should run. |
