(function() {
	var app, express, http, path;
	express = require('express');
	http = require('http');
	path = require('path');
	app = express();
	
	app.configure(function() {
		app.set('port', process.env.PORT || 3000);
		return app.use(express["static"](path.join(__dirname, 'public')));
	});
	
	app.configure('development', function() {
		return app.use(express.errorHandler());
	});
	
	http.createServer(app).listen(app.get('port'), function() {
		return console.log('Express server listening on port ' + app.get('port'));
	});
}).call(this);
