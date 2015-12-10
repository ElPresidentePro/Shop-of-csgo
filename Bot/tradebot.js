// ################# Login Options ################//

var logOnOptions = {
	accountName: '',
	password: ''
};

var authCode = ''; 

var globalSessionID;

// ################# Files Options ################//

if (require('fs').existsSync('sentry_'+logOnOptions['accountName']+'.hash')) {
	logOnOptions['shaSentryfile'] = require('fs').readFileSync('sentry_'+logOnOptions['accountName']+'.hash');
} else if (authCode != '') {
	logOnOptions['authCode'] = authCode;
}

// ################# System ################//

var Steam = require('steam');
var SteamTradeOffers = require('steam-tradeoffers');
var mysql      = require('mysql');
var request = require("request");
var steamuserinfo = require('steam-userinfo');

steamuserinfo.setup("website steam api");
// ################# MYSQL System ################//
var mysqlInfo;
mysqlInfo = {
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'database',
  charset  : 'utf8_general_ci'
};

var mysqlConnection = mysql.createConnection(mysqlInfo);
// ################# System ################//
var steam = new Steam.SteamClient();
var offers = new SteamTradeOffers();

steam.logOn(logOnOptions);

steam.on('debug', console.log);

function getUserName(steamid) {
	steamuserinfo.getUserInfo(steamid, function(error, data){
		if(error) throw error;
		var datadec = JSON.parse(JSON.stringify(data.response));
		return (datadec.players[0].personaname);
	});
}

steam.on('loggedOn', function(result) {
	console.log('Logged in!');
	steam.setPersonaState(Steam.EPersonaState.LookingToTrade);
});

steam.on('webSessionID', function(sessionID) {
	globalSessionID = sessionID;
	steam.webLogOn(function(newCookie) {
		offers.setup({
			sessionID: sessionID,
			webCookie: newCookie
		}, function(err) {
			if (err) {
				throw err;
			}
			setInterval(CheckTimer,1000);
		});
	});
});


steam.on('sentry', function(data) {
	require('fs').writeFileSync('sentry_'+logOnOptions['accountName']+'.hash', data);
});