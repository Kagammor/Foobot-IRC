var es6 = require('es6-shim');

var config = require('./config.json');

var irc = require('irc');
var request = require('request');
var fs = require('fs');

var moment = require('moment');
var util = require('util');
var note = require('./modules/note.js');

var client = new irc.Client(config.network.server, config.nick, {
    "port": config.network.port,
    'userName': config.username,
    'realName': config.realname
});

client.addListener('error', function(error) {
    note('foobot', 2, error);
});

client.addListener('registered', function(message) {
    note('foobot', 0, 'Connected to \'' + message.server + '\'!');

    config.channels.forEach(function(channel) {
        client.join(channel, function() {
            note('foobot', 0, 'Joined ' + channel);
        });
    });
});

var log = require('./modules/log.js')(es6, config, client, request, moment, fs, note, util);
var weather = require('./modules/weather.js')(config, client, request, note, util);
var define = require('./modules/define.js')(config, client, request, note, util);
var urban = require('./modules/urban.js')(config, client, request, note, util);
var currency = require('./modules/currency.js')(config, client, request, note, util);
var translate = require('./modules/translate.js')(config, client, request, note, util);
var youtube = require('./modules/youtube.js')(config, client, request, note, util);

client.addListener('message', function(from, to, message) {
    log.write(from, to, message);

    if(message.substring(0,1) === config.prefix) {
        var command = message.substring(1).split(' ')[0];
        var args = message.substring(1).split(' ').slice(1);

        switch(command) {
            case 'join':
                if(args[1] === config.adminPass) {
                    client.join(args[0], to, from);
                }
                break;
            case 'last':
                log.last(args, to, from);
                break;
            case 'weather':
                weather(args, to, from);
                break;
            case 'define':
                define(args, to, from);
                break;
            case 'urban':
            case 'ud':
                urban(args, to, from);
                break;
            case 'convert':
            case 'ex':
                currency(args, to, from);
                break;
            case 'translate':
                translate(args, to, from);
                break;
            case 'yt':
            case 'youtube':
                youtube(args, to, from);
                break;
            default:
                client.say(to, 'No idea what you\'re uttering, ' + from + '!');
        }
    }
});
