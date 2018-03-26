var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    crypto = require('crypto'),
    StudentAccount = model.studentAccount,
    EnrollProcessConfigure = model.enrollProcessConfigure,
    auth = require("./auth"),
    checkNotLogin = auth.checkNotLogin;

module.exports = function (app) {
    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        EnrollProcessConfigure.getFilter({})
            .then(function (configure) {
                if (configure.isOpenRigister) {
                    res.render('Client/reg.html', {
                        title: '注册',
                        user: req.session.user
                    });
                } else {
                    res.redirect('/login');
                }
            });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        var name = req.body.name,
            md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = {
            name: req.body.name,
            password: password
        };
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
                    StudentAccount.create(newUser)
                        .then(function (user) {
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