var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    crypto = require('crypto'),
    StudentAccount = model.studentAccount,
    auth = require("./auth"),
    checkNotLogin = auth.checkNotLogin; // TBD

module.exports = function (app) {
    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('Client/reg.html', {
            title: '注册',
            user: req.session.user
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        var name = req.body.name,
            password = req.body.password; //,
        // password_re = req.body['password-repeat'];
        //检验用户两次输入的密码是否一致
        // if (password_re != password) {
        // 	return res.redirect('/reg'); //返回主册页
        // }
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new StudentAccount({
            name: req.body.name,
            password: password
        });
        //检查用户名是否已经存在 
        StudentAccount.getFilter({
                name: req.body.name
            })
            .then(function (account) {
                if (account) {
                    return res.render('Client/reg.html', {
                        title: '注册',
                        error: "用户名已经存在"
                    }); //返回注册页
                } else {
                    //如果不存在则新增用户
                    newUser.save().then(function (user) {
                        if (user) {
                            //将用户信息存入 session
                            req.session.user = user.toJSON();
                            res.redirect(req.session.originalUrl ? req.session.originalUrl : '/'); //登陆成功后跳转到主页
                            //return res.redirect('/login'); //注册成功
                            return;
                        }
                        return res.render('Client/reg.html', {
                            title: '注册',
                            error: "注册失败"
                        }); //返回注册页
                    });
                }
            });
    });
}