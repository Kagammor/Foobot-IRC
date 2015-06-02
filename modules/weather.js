var moment = require('moment');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = function(config, client, request, note, util) {
    return function weather(args, channel, user) {
		if(args.length > 0) {
            var arg = args.join(' ');

			request.get({
				'url': 'http://api.openweathermap.org/data/2.5/weather',
				'qs': {
					'q': arg,
					'units': 'metric',
					'APPID': '2b27f9ae3dbf961b511fd59fa191d6a0'
				},
				'json': true
			}, function(error, response, body) {
				// Check if there are any errors
				if(error) {
					note('weathr', 2, error);
					client.say(channel, 'Something went wrong trying to fetch the weather! :(');
				// Check if there is an API response
				} else if(!body) {
					client.say(channel, 'The weatherman seems to ignore me! :(');
					note('weathr', 1, 'No response from OpenWeatherMap API!');
				// Check if API returned valid weather data
				} else if(body.cod != 200) {
					client.say(channel, 'There doesn\'t seem to be any weather in ' + arg + '!');
				} else {
					// Redefine weather to object
					var wx = {
                        'time': moment.unix(body.dt).fromNow(),
						'city': body.name,
						'country': body.sys.country,
						'temp': {
							'c': Math.round(body.main.temp),
							'f': Math.round((body.main.temp * 1.8) + 32)
						},
						'humid': body.main.humidity,
						'cond': body.weather[0].description.capitalize(),
						'wind': {
							'speed': {
								'ms': Math.round(body.wind.speed),
								'kph': Math.round(body.wind.speed * 3.6),
								'mph': Math.round(body.wind.speed * 3.6 / 2.237)
							},
							'deg': Math.round(body.wind.deg)
						}
					}

					// Convert wind degree to trivial angle
					if(wx.wind.deg >= 338 || (wx.wind.deg >= 0 && wx.wind.deg < 23)) {
						wx.wind.icon = '↓';
						wx.wind.dir = 'North';
					} else if(wx.wind.deg >= 23 && wx.wind.deg < 68) {
						wx.wind.icon = '↙';
						wx.wind.dir = 'North East';
					} else if(wx.wind.deg >= 68 && wx.wind.deg < 113) {
						wx.wind.icon = '←';
						wx.wind.dir = 'East';
					} else if(wx.wind.deg >= 113 && wx.wind.deg < 158) {
						wx.wind.icon = '↖';
						wx.wind.dir = 'South East';
					} else if(wx.wind.deg >= 158 && wx.wind.deg < 203) {
						wx.wind.icon = '↑';
						wx.wind.dir = 'South';
					} else if(wx.wind.deg >= 203 && wx.wind.deg < 248) {
						wx.wind.icon = '↗';
						wx.wind.dir = 'South West';
					} else if(wx.wind.deg >= 248 && wx.wind.deg < 293) {
						wx.wind.icon = '→';
						wx.wind.dir = 'West';
					} else if(wx.wind.deg >= 293 && wx.wind.deg < 338) {
						wx.wind.icon = '↘';
						wx.wind.dir = 'North West';
					}

					// Check if weather description ID implies rain or snow and set downfall in mm
					if(body.rain) {
						if(body.weather[0].id >= 500 && body.weather[0].id < 600) {
							if(body.rain['1h']) {
								wx.rain = body.rain['1h'];
							} else if(body.rain['3h']) {
								wx.rain = body.rain['3h'];
							}
						}
					} else if(body.snow) {
						if(body.weather[0].id >= 600 && body.weather[0].id < 700) {
							if(body.snow['1h']) {
								wx.snow = body.snow['1h'];
							} else if(body.snow['3h']) {
								wx.snow = body.snow['3h'];
							}
						}
					}

                    client.say(channel, 'It\'s ' + wx.temp.c + '°C (' + wx.temp.f + '°F) in ' + (wx.city ? wx.city + ', ' : '') + wx.country + ' (' + wx.humid + '% humidity). Condition: ' + wx.cond + (wx.rain ? ' (' + wx.rain + 'mm)' : '') + (wx.snow ? ' (' + wx.snow + 'mm)' : '') + ' with winds at ' + wx.wind.speed.kph + 'km/h (' + wx.wind.speed.mph + 'mph) from the ' + wx.wind.icon + ' ' + wx.wind.dir + ' (' + wx.wind.deg + '°). - ' + wx.time);
				}
			});
		} else {
			client.say(channel, 'Syntax: ' + config.prefix + 'weather [city]');
		}
	};
};
