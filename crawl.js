var https 	= require('https');
var http  	= require('http');

var version = '0.0.1';
var trynum  = 0;

var options = {
  host: 'host.com',
  port: 443,
  path: '/en/content/test',
  proto: https,
  headers: {
     'User-Agent': 'creep ' + version
  },
  text2search: "<p>This is a test string, which is currently on the website and we are listening if it changes.</p>",
  yourMail: 'mail@host.com',
  mailSubj: 'creep Bot found changes!',
  botMail: 'bot@root-server.com',
  mailText: 'There are changes on ',
  crawlInterval: 100000
};


initBot();

function initBot() {

	var interval = options.crawlInterval;
	var unit = 'ms';
	
	if(interval >= 1000) {
		unit = 's';
		interval /= 1000; 
		
		if(interval >= 60) {
			unit = 'm';
			interval /= 60; 
			
			if(interval >= 60) {
				unit = 'h';
				interval /= 60; 
			}
		}
	}
	
	console.log(">>creepBot v." + version + " has started up with config:");
	console.log("	Refresh every: " + interval + unit);
	console.log("	Request: " + options.host + ":" + options.port + "  ||  on path " + options.path);
	console.log("	Report to: " + options.yourMail);
	console.log("<<<<");
	
	fetchAndParse();
}


function fetchAndParse() {

	console.log("[" + process.hrtime() + "] - #" + trynum + " Connecting to " + options.host + ":" + options.port + "  ||  on path " + options.path);
	
	trynum++;

	var request = options.proto.request(options, function (res) {
	    var data = '';
	    
	    res.on('data', function (chunk) {
	        data += chunk;
	    });
	    
	    res.on('end', function () {
	        
	        if (data.indexOf(options.text2search) >= 0) {
		        console.log("[" + process.hrtime() + "] - Noting changed...");
	        }else{
		        console.log("[" + process.hrtime() + "] - Found change while fetch #" + trynum);
		        
		        var nodemailer = require('nodemailer');
				var transporter = nodemailer.createTransport();
				
				transporter.sendMail({
				    from: 	 options.botMail,
				    to: 	 options.yourMail,
				    subject: options.mailSubj,
				    text: 	 options.mailText + options.host + options.path
				}, function() {
					process.exit(code=0);
				});
				
	        }
	        
	    });
	});
	
	request.on('error', function (e) {
	    console.log(e.message);
	});
	
	request.end();
}

setInterval(function() {
    fetchAndParse();
}, options.crawlInterval);

