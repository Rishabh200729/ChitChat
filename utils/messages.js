const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}
function formatchatMessage(username,text,time){
	return {
		username,
		text,
		time
	}
}
module.exports.formatMessage = formatMessage;
module.exports.formatchatMessage = formatchatMessage