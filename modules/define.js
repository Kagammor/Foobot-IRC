module.exports = function(config, client, request, note, util) {
	return function define(args, channel, user) {
		if(args) {
            var arg = args.join(' ');

			request.get({
				'url': 'http://api.wordnik.com/v4/word.json/' + arg + '/definitions',
				'qs': {
					'limit': 1,
					'includeRelated': false,
					'useCanonical': true,
					'includeTags': false,
					'api_key': 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5'
				},
				'json': true
			}, function(error, response, body) {
				// Check if there are any errors
				if(error) {
					note('dfine', 2, error);
					client.say(channel, 'Something went wrong trying to define your word! :(');
				// Check if there is an API response
				} else if(arg.toLowerCase() === config.nick.toLowerCase()) {
					client.say(channel, 'That\'d be me! :D');
				} else if(!body) {
					client.say(channel, 'I can\'t find the dictionary! :(');
					note('dfine', 2, 'No response from Wordnik API!');
				// Check if API returned valid weather data
				} else if(!body[0]) {
					client.say(channel, 'That word doesn\'t seem to be in the dictionary. Try ~urban [term]!');
				// A 400 apparently doesn't throw a proper request error
				} else if(body.indexOf('400 Bad request') != -1) {
					client.say(channel, 'I failed looking up that word. :( Please avoid using any special characters (accents, etc.)!');
				} else {
					var def = {
						'word': body[0].word,
						'type': body[0].partOfSpeech,
						'text': body[0].text
					}

					// Get pronunciation
					request.get({
						'url': 'http://api.wordnik.com/v4/word.json/' + arg + '/pronunciations',
						'qs': {
							'limit': 1,
							'sourceDictionary': 'ahd-legacy',
							'useCanonical': true,
							'api_key': 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5'
						},
						'json': true
					}, function(error, response, body) {
						// Check for valid result, otherwise exclude pronounciation
						if(body[0] && !error) {
							def['pron'] = body[0].raw;
						}

						client.say(channel, (def.type ? '[' + def.type + '] ' : '') + def.word + (def.pron ? ' ' + def.pron : '') + ': ' + def.text);
					});
				}
			});
		} else {
			client.say(channel, 'Syntax: ' + config.prefix + 'define [expression]');
		}
	}
};
