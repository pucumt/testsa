var crypto = require('crypto'),
    model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Teacher = model.teacher,
    auth = require("./auth"),
    checkNotLogin = auth.checkNotLogin;

module.exports = function (app) {
    // app.get('/Teacher/login', checkNotLogin);
    app.get('/Teacher/login', function (req, res) {
        res.render('Teacher/login.html', {
            title: '登录',
            user: req.session.teacher
        });
    });

    // app.post('/Teacher/login', checkNotLogin);
    app.post('/Teacher/login', function (req, res) {
        //登录注册放在一起
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        Teacher.getFilter({
                mobile: req.body.name
            })
            .then(function (user) {
                if (!user) {
                    return res.redirect('/Teacher/login?err=1'); //用户不存在则跳转到登录页
                }
                //检查密码是否一致
                if (user.password != password) {
                    return res.redirect('/Teacher/login?err=2'); //密码错误则跳转到登录页
                }
                //用户名密码都匹配后，将用户信息存入 session                
                if (req.body.type == "0") {
                    req.session.teacher = user;
                    res.redirect('/Teacher/personalCenter'); //登陆成功后跳转到主页
                } else if (req.body.type == "1") {
                    req.session.admin = user;
                    //登陆成功后跳转到主页 PC端
                    if (user.role == 11) {
                        res.redirect('/admin/peopleCountList');
                    } else if (user.role == 20) {
                        // 普通老师
                        res.redirect('/admin/quizScoreList');
                    }
                }
            });
    });
}