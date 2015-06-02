String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = function(config, client, request, note, util) {
	return function urban(args, channel, user) {
		if(args.length > 0) {
            arg = args.join(' ');

			request.get({
				'url': 'http://api.urbandictionary.com/v0/define',
				'qs': {
					'term': arg
				},
				'json': true
			}, function(error, response, body) {
				// Check if there are any errors
				if(error) {
					note('urban', 2, error);
					client.say(channel, 'Something went wrong trying to define your slang! :(');
				// Check if there is an API response
				} else if(arg.toLowerCase() === config.botname) {
					client.say(channel, 'That\'d be me, yo! :D');
				} else if(!body) {
					note('urban', 2, 'No response from Urban Dictionary API!');
					client.say(channel, 'I can\'t find the urban dictionary! :(');
				} else if(body.result_type != "exact") {
					client.say(channel, 'No one seems to be using that term!');
				} else {
					var slang = {
						'word': body.list[0].word,
						'definition': body.list[0].definition.capitalize(),
						'example': body.list[0].example
					};

					client.say(channel, '[urban] ' + slang.word + ': ' + slang.definition + (slang.example !== '' ? ' —  ' + slang.example : ''));
				}
			});
		} else {
			client.say(channel, 'Syntax: ' + config.prefix + 'urban [term], or: ~slang [term]');
		}
	}
};
