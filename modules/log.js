module.exports = function(es6, config, client, request, moment, fs, note, util) {
    return {
        'write': function(from, to, message) {
            var line = moment() + ' <' + from + '> ' + message + '\n';

            fs.appendFile('logs/' + to, line, function(error) {
                if(error) {
                    note('logger', 2, error);
                }
            });
        },
        'last': function(args, to, from) {
            if(args[0]) {
                fs.readFile('logs/' + to, function(error, data) {
                    if(error) {
                        note('logger', 2, error);
                    } else {
                        var allMessages = data.toString().split('\n').reverse();

                        var findLastMessage = function(message) {
                            return message.replace('<' + args[0] + '>', '').length < message.length ? true : false;
                        }

                        var lastMessage = allMessages.find(findLastMessage);

                        if(lastMessage) {
                            var lastSeen = moment(parseInt(lastMessage.split(' ')[0])).fromNow();
                            var message = lastMessage.split(' ').slice(1).join(' ');

                            client.say(to, args[0] + ' was last seen ' + lastSeen + ': ' + message);
                        } else {
                            client.say(to, 'I haven\'t seen that user around yet!');
                        }
                    }
                });
            } else {
                client.say(to, 'Syntax: ~last [user]');
            }
        }
    }
};
