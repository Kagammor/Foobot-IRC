String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = function(config, client, request, note, util) {
	return function translate(args, channel, user) {
		if(args[0] && args[1] && args[2]) {
			var input = args.splice(2).join(' ');

			// Try to convert languages to ISO codes
			request.get({
				'url': 'https://translate.yandex.net/api/v1.5/tr.json/getLangs',
				'qs': {
					'ui': 'en',
					'key': 'trnsl.1.1.20150217T014840Z.ce0401394bb45418.ccee3404e807079a18162cb5e605a710254c09ea'
				},
				'json': true
			}, function(error, response, body) {
				var transl = {
					'langs': {
						'from': args[0].toUpperCase(),
						'to': args[1].toUpperCase(),
					}
				}

				if(error) {
					note('transl', 2, error);
				} else if(!(body ? body.langs : true)) {
					note('transl', 2, 'No response from Yandex getLangs API!');
				} else {
					// Set languages to ISO codes if found
					for(var lang in body.langs) {
						if(body.langs[lang].toLowerCase() === args[0].toLowerCase() || lang === args[0].toLowerCase()) {
							transl.langs['fromISO'] = lang;
							transl.langs['from'] = body.langs[lang].capitalize();
						}
						if(body.langs[lang].toLowerCase() === args[1].toLowerCase() || lang === args[1].toLowerCase()) {
							transl.langs['toISO'] = lang;
							transl.langs['to'] = body.langs[lang].capitalize();
						}
					}
				}

				// Request translation
				request.get({
					'url': 'https://translate.yandex.net/api/v1.5/tr.json/translate',
					'qs': {
						'text': input,
						'key': 'trnsl.1.1.20150217T014840Z.ce0401394bb45418.ccee3404e807079a18162cb5e605a710254c09ea',
						'lang':transl.langs.fromISO + '-' + transl.langs.toISO
					},
					'json': true
				}, function(error, response, body) {
					// Check if there are any errors
					if(error) {
						note('transl', 2, error);
						client.say(channel, 'Something went wrong trying to translate! :(');
					// Check if there is an API response
					} else if(!body) {
						client.say(channel, 'The translator seems to ignore me! :(');
						note('transl', 2, 'No response from Yandex Translation API!');
					} else if(body.code != 200) {
						client.say(channel, 'I failed to translate that. Please try using ISO 639 language codes (en, de, ru, etc.)!');
						note('transl', 2, (body.code || 'Unidentified error from Yandex API.'));
					} else {
						transl['input'] = input.capitalize();
						transl['result'] = body.text[0].capitalize();

						client.say(channel, '[' + transl.langs.from + ' →  ' + transl.langs.to + '] ' + transl.input + ' →  ' + transl.result);
					}
				});
			});
		} else {
			client.say(channel, 'Syntax: ' + config.prefix + 'translate [language1] [language2] [text]');
		}
	}
}
