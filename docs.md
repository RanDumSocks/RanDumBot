<a name="RanDumBot"></a>

## RanDumBot
All purpose Twitch bot using tmijs.

**Kind**: global class  

* [RanDumBot](#RanDumBot)
    * [new RanDumBot()](#new_RanDumBot_new)
    * [.commandMap](#RanDumBot+commandMap)
    * [.client](#RanDumBot+client)
    * [.currentViewers](#RanDumBot+currentViewers)
    * [.debugMsg(msg, [info], [color], [verbose], [sync])](#RanDumBot+debugMsg)
    * [.setUserData(user, key, value)](#RanDumBot+setUserData)
    * [.getUserData(user, key)](#RanDumBot+getUserData) ⇒ <code>string</code>

<a name="new_RanDumBot_new"></a>

### new RanDumBot()
Sets up tmijs client.
Must have valid environment variables.
See [Environment Variables Setup](https://github.com/RanDumSocks/RanDumBot/wiki#environment-variables)

<a name="RanDumBot+commandMap"></a>

### ranDumBot.commandMap
A list of all avaliable commands and their functions in the form of
  [[commandName, [functions]], ...]

**Kind**: instance property of [<code>RanDumBot</code>](#RanDumBot)  
<a name="RanDumBot+client"></a>

### ranDumBot.client
The tmijs client object. See
[tmijs](https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2)
For full documentation

**Kind**: instance property of [<code>RanDumBot</code>](#RanDumBot)  
<a name="RanDumBot+currentViewers"></a>

### ranDumBot.currentViewers
Array of current viewers on the channel

**Kind**: instance property of [<code>RanDumBot</code>](#RanDumBot)  
<a name="RanDumBot+debugMsg"></a>

### ranDumBot.debugMsg(msg, [info], [color], [verbose], [sync])
Outputs message to the console.

**Kind**: instance method of [<code>RanDumBot</code>](#RanDumBot)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>string</code> |  | message to output |
| [info] | <code>string</code> | <code>&quot;Info&quot;</code> | message tag |
| [color] | <code>object</code> |  | color of the tag, see   [Colors](https://www.npmjs.com/package/colors) |
| [verbose] | <code>boolean</code> | <code>false</code> | only outputs if verbose logging is on,   always saves to log file reguardless |
| [sync] | <code>boolean</code> |  | Whether fline IO should be handled synchronously |

<a name="RanDumBot+setUserData"></a>

### ranDumBot.setUserData(user, key, value)
Sets user's data as a key, value pair.

**Kind**: instance method of [<code>RanDumBot</code>](#RanDumBot)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>string</code> | username of the data to set, NOT display name |
| key | <code>string</code> | key to change |
| value | <code>\*</code> | value of the key |

<a name="RanDumBot+getUserData"></a>

### ranDumBot.getUserData(user, key) ⇒ <code>string</code>
Gets user's data value from given key.

**Kind**: instance method of [<code>RanDumBot</code>](#RanDumBot)  
**Returns**: <code>string</code> - value fetched from key  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>string</code> | username of the data to set, NOT display name |
| key | <code>string</code> | key to get value from |

