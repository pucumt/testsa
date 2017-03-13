var User = require('../../models/100Tasks.js')
	auth = require("./100auth"),
	checkNotLogin = auth.checkNotLogin,
	checkLogin = auth.checkLogin;

module.exports = function(app) {
	app.get('/100', checkLogin);
	app.get('/100', function(req, res) {
		res.render('Client/100/tasks', {
			title: '做题',
			user: req.session.user
		});
	});

	app.get('/100/login', function(req, res) {
		res.render('Client/100/login', {
			title: '登录',
			user: req.session.user
		});
	});
	app.post('/100/login', function(req, res) {
		//检查用户是否存在
		// User.get(req.body.name, function(err, user) {
		// 	if (!user) {
		// 		req.flash('error', '用户不存在!');
		// 		return res.redirect('/100/login'); //用户不存在则跳转到登录页
		// 	}
		// 	//检查密码是否一致
		// 	if (user.password != password) {
		// 		req.flash('error', '密码错误!');
		// 		return res.redirect('/100/login'); //密码错误则跳转到登录页
		// 	}
		// 	//用户名密码都匹配后，将用户信息存入 session
		// 	req.session.user = user;
		// 	req.flash('success', '登陆成功!');
		// 	res.redirect('/100'); //登陆成功后跳转到主页
		// });
		var user = {name:req.body.name, phone:req.body.phone};
		req.session.user = user;
		res.redirect('/100'); //登陆成功后跳转到主页
	});

	app.get('/100/top10', function(req, res) {
		res.render('Client/100/top10', {
			title: 'Top 10',
			user: req.session.user
		});
	});

	app.get('/100/logout', checkLogin);
	app.get('/100/logout', function(req, res) {
		req.session.user = null;
		res.redirect('/100/login'); //登出成功后跳转到主页
	});

	app.post('/100', checkLogin);
	app.post('/100', function(req, res) {
		
	});
}