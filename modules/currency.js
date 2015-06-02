module.exports = function(config, client, request, note, util) {
	return function currency(args, channel, user) {
		if(args) {
            // Check if arguments are set (input optional, but must be numeral if given)
            if(args[0] && args[1] && (args[2] ? args[0].match(/[0-9]/g) : true)) {
                // Set values according to whether input argument is given or not
                var input = (args[2] ? args[0] : '1');
                var cur1 = (args[2] ? args[1] : args[0]);
                var cur2 = (args[2] ? args[2] : args[1]);

                // Convert common trivial currency names to ISO codes
                String.prototype.toIso = function(trivial) {
                    var isos = {
                        'bitcoin': 'BTC',
                        'buck': 'USD',
                        'dollar': 'USD',
                        'dong': 'VND',
                        'euro': 'EUR',
                        'gulden': 'ANG',
                        'koruna': 'CZK',
                        'krona': 'SEK',
                        'krone': 'DKK',
                        'peso': 'MXN',
                        'pound': 'GBP',
                        'rand': 'ZAR',
                        'rupee': 'INR',
                        'quid': 'GBP',
                        'won': 'KRW',
                        'yen': 'JPY'
                    }

                    // Check for trivial name and force check singular
                    if(isos[this] || isos[this.substring(0, this.length - 1)]) {
                        return (isos[this] || isos[this.substring(0, this.length - 1)]);
                    } else {
                    // If no trivial name is available, return original input
                        return this.toUpperCase();
                    }
                }

                // Convert input to uppercase for API
                var curs = cur1.toIso() + '_' + cur2.toIso();

                request.get({
                    'url': 'http://www.freecurrencyconverterapi.com/api/v3/convert',
                    'qs': {
                        'q': curs
                    },
                    'json': true
                }, function(error, response, body) {
                    // Check if there are any errors
                    if(error) {
                        note('money', 2, error);
                        client.say(channel, 'Something went wrong trying to convert those currencies! :(');
                    // Check if there is an API response
                    } else if(!body) {
                        note('money', 2, 'No response from the Free Currency Converter API!');
                        client.say(channel, 'I can\'t convert those currencies for you at the moment! :(');
                    } else if(Object.keys(body.results).length < 1) {
                        client.say(channel, 'Please try using ISO 4217 currency codes (EUR, USD, GBP, etc.)!');
                    } else if(!body.results[curs]) {
                        client.say(channel, 'Please try using ISO 4217 currency codes (EUR, USD, GBP, etc.)!');
                    } else {
                        var ex = {
                            'rate': body.results[curs].val,
                            'from': body.results[curs].fr,
                            'to': body.results[curs].to,
                            'given': parseFloat(input.replace(',', '.'), 10).toFixed(2),
                            'result': (body.results[curs].val * parseFloat(input.replace(',', '.'), 10)).toFixed(2)
                        }

                        // Get currency names
                        request.get({
                            'url': 'http://www.freecurrencyconverterapi.com/api/v3/currencies',
                            'json': true
                        }, function(error, response, body) {
                            if(body) {
                                // Check for valid result, otherwise sustain currency codes
                                if(body.results[ex.from]) {
                                    ex['fromName'] = body.results[ex.from].currencyName;
                                }
                                if(body.results[ex.to]) {
                                    ex['toName'] = body.results[ex.to].currencyName;
                                }
                            }

                            client.say(channel, ex.given + ' ' + (ex.fromName ? ex.fromName : ex.from) + ' is ' + (ex.result <= 0.10 ? '~' + ex.result : ex.result)  + ' ' + (ex.toName ? ex.toName : ex.to) + ' at ' + ex.rate + ' ' + ex.to + '/' + ex.from + '.');
                        });
                    }
                });
            } else {
                client.say(channel, 'Syntax: ' + config.prefix + 'currency exchange {amount} [EUR] [USD], or: ~exchange {amount} [EUR] [USD]');
            }
		} else {
			client.say(channel, 'Syntax: ' + config.prefix + 'currency [exchange] {amount} [currency1] [currency2]');
		}
	}
}
