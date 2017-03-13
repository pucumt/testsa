var auth = require("./auth"),
	checkLogin = auth.checkLogin;

module.exports = function(app) {
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) {
		req.session.user = null;
		res.redirect('/'); //登出成功后跳转到主页
	});
}