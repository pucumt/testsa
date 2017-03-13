var crypto = require('crypto'),
	User = require('../../models/user.js'),
	auth = require("./auth"),
	checkNotLogin = auth.checkNotLogin;

module.exports = function(app) {
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('Client/reg', {
			title: '注册',
			user: req.session.user
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
		//检验用户两次输入的密码是否一致
		if (password_re != password) {
			return res.redirect('/reg'); //返回主册页
		}
		//生成密码的 md5 值
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name: req.body.name,
			password: password,
			email: req.body.email
		});
		//检查用户名是否已经存在 
		User.get(newUser.name, function(err, user) {
			if (user) {
				return res.redirect('/reg'); //返回注册页
			}
			//如果不存在则新增用户
			newUser.save(function(err, user) {
				if (err) {
					return res.redirect('/reg'); //注册失败返回主册页
				}
				req.session.user = user; //用户信息存入 session
				res.redirect('/'); //注册成功后返回主页
			});
		});
	});
}