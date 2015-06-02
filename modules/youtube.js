var numeral = require('numeral');
var moment = require('moment');

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = function(config, client, request, note, util) {
	return function youtube(args, channel, user) {
		if(args[0]) {
			request.get({
				'url': 'https://www.googleapis.com/youtube/v3/search',
				'qs': {
					'q': args.join(' '),
					'part': 'snippet',
					'type': 'video',
					'maxResults': 1,
					'key': 'AIzaSyAuz3TDTHfoO3_KctO9u4pgm3nARiqHVfE'
				},
				'json': true
			}, function(error, response, body) {
				// Check if there are any errors
				if(error) {
					note('youtub', 2, error);
					client.say(channel, 'Something went wrong trying to find your youtube video! :(');
				// Check if there is an API response
				} else if(!body) {
					note('youtub', 2, 'No response from YouTube API!');
					client.say(channel, 'YouTube seems to be ignoring me! :(');
				} else if(body.pageInfo.totalResults < 1) {
					client.say(channel, 'I can\'t find any relevant YouTube videos!');
				} else {
					var yt = {
						'title': body.items[0].snippet.title,
						'id': body.items[0].id.videoId,
                        'url': 'https://youtu.be/' + body.items[0].id.videoId,
						'channel': {
							'title': body.items[0].snippet.channelTitle,
							'url': 'https://www.youtube.com/user/' + body.items[0].snippet.channelTitle
						}
					}

					request.get({
						'url': 'https://www.googleapis.com/youtube/v3/videos',
						'qs': {
							'id': yt.id,
							'part': 'statistics,contentDetails',
							'key': 'AIzaSyAuz3TDTHfoO3_KctO9u4pgm3nARiqHVfE'
						},
						'json': true
					}, function(error, response, body) {
						if(error) {
							note('youtub', 2, error);
							client.say(channel, 'Something went wrong trying to retrieve your youtube video! :(');
						} else if(!body) {
							note('youtub', 2, 'No response from YouTube API!');
							client.say(channel, 'YouTube seems to be ignoring me! :(');
						} else if((body.pageInfo ? body.pageInfo.totalResults : false) < 1) {
							note('youtub', 2, util.inspect(body));
							client.say(channel, 'I failed while retrieving the statistics for your video! :(');
						} else {
							// Get video duration in PT1H6M11S format
							var duration = body.items[0].contentDetails.duration;

							// Extract elements from time
							var hours = duration.match(/([\d]+)(?=H)/g);
							var minutes = duration.match(/([\d]+)(?=M)/g);
							var seconds = duration.match(/([\d]+)(?=S)/g);

							// Add leading zero to numbers smaller than 10
							var prefixZero = function(number) {
								return (number < 10 ? '0' + number : number);
							}

							// Add duration in (hh:i)i:ss format to object
							yt['duration'] = (hours ? prefixZero(hours) + ':' : '') + (minutes ? (hours ? prefixZero(minutes) : minutes) + ':' : (hours ? '00:' : '0:')) + (seconds ? prefixZero(seconds) : '00');

							yt['views'] = numeral(body.items[0].statistics.viewCount).format('0,0');
							yt['likes'] =  numeral(body.items[0].statistics.likeCount).format('0,0');
							yt['dislikes'] = numeral(body.items[0].statistics.dislikeCount).format('0,0');

                            client.say(channel, yt.title + ' (' + yt.duration + ')' + (yt.channel.title ? ' by ' + yt.channel.title : '') + ' | ▶ ' + yt.views + ' ▲ ' + yt.likes + ' ▼ ' + yt.dislikes + ' | ' + yt.url);
						}
					});
				}
			});
		} else {
			client.say(channel, 'Syntax: ' + config.prefix + 'youtube [keywords], or: ~yt [keywords]');
		}
	}
}
