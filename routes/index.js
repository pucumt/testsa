var client = require('./Client/index.js'),
	exec = require('child_process').exec;//,
//server = require('./Server/index.js');

module.exports = function(app)
{
	client(app);

	//server(app);

	app.use(function(req, res)
	{
		res.render("404");
	});

};