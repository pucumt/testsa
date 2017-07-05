var crypto = require('crypto'),
    User = require('../../models/user.js'),
    auth = require("./auth"),
    checkNotLogin = auth.checkNotLogin;

module.exports = function(app) {
    app.get('/admin/login', checkNotLogin);
    app.get('/admin/login', function(req, res) {
        res.render('Server/login.html', {
            title: '登录',
            user: req.session.admin
        });
    });

    app.post('/admin/login', checkNotLogin);
    app.post('/admin/login', function(req, res) {
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.get(req.body.name, function(err, user) {
            if (!user) {
                return res.redirect('/admin/login'); //用户不存在则跳转到登录页
            }
            //检查密码是否一致
            if (user.password != password) {
                return res.redirect('/admin/login'); //密码错误则跳转到登录页
            }
            //用户名密码都匹配后，将用户信息存入 session
            if (user.role == 10) {
                req.session.adminRollCall = user;
                res.redirect('/admin/adminRollCallList'); //登陆成功后跳转到主页
            } else {
                req.session.admin = user;
                res.redirect('/admin/adminEnrollTrainList'); //登陆成功后跳转到主页
            }
        });
    });
}

//"e18eb774e4c5025df2caef84a0e09234"