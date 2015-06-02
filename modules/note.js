var clc = require('cli-color');
var moment = require('moment');

module.exports = function note(source, level, msg, highlight) {
    var levels = ['INFO', 'WARN', 'ERRO'];

    if(highlight) {
        msg = clc.cyanBright.bold(msg);
    }

    if(level === 1) {
        msg = clc.yellowBright(msg);
        level = clc.yellowBright('[' + levels[level] + ']');
    } else if(level === 2) {
        msg = clc.redBright(msg);
        level = clc.redBright('[' + levels[level] + ']');
    } else {
        level = clc.cyanBright('[' + levels[level] + ']');
    }

    while(source.length < 6) {
        source = '_' + source;
    }

    console.log(clc.green('[' + moment().format("YYYY-MM-DD HH:mm:ss") + ']') + clc.cyan('[' + source.substring(0,6).toUpperCase() + ']') + level + ' ' + msg);
}
