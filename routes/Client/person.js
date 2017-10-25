var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    StudentInfo = model.studentInfo,
    CouponAssign = model.couponAssign,
    StudentAccount = model.studentAccount,
    crypto = require('crypto'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function (app) {
    app.get('/personalCenter', checkLogin);
    app.get('/personalCenter', function (req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter.html', {
            title: '个人中心',
            user: req.session.user
        });
    });

    app.get('/personalCenter/resetPWD', checkLogin);
    app.get('/personalCenter/resetPWD', function (req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_resetPWD.html', {
            title: '个人中心',
            user: req.session.user
        });
    });

    app.post('/personalCenter/resetPWD', checkJSONLogin);
    app.post('/personalCenter/resetPWD', function (req, res) {
        var currentUser = req.session.user;
        if (currentUser.password != req.body.oldPassword) {
            res.jsonp({
                error: "旧密码不正确"
            });
            return;
        }
        StudentAccount.update({
                password: req.body.password
            }, {
                where: {
                    _id: currentUser._id
                }
            })
            .then(function () {
                currentUser.password = req.body.password;
                res.jsonp({
                    sucess: true
                });
            });
    });


    app.post('/app/login', function (req, res) {
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        StudentAccount.getFilter({
                name: req.body.name
            })
            .then(function (user) {
                if (!user) {
                    res.jsonp({
                        error: "没有找到用户"
                    });
                    return;
                }
                //检查密码是否一致
                if (user.password != password) {
                    res.jsonp({
                        error: "密码不正确"
                    });
                    return;
                }
                StudentInfo.getFilters({
                        accountId: user._id
                    })
                    .then(function (students) {
                        res.jsonp({
                            sucess: true,
                            students: students
                        });
                    });
            })
            .catch(function (err) {
                //error to handle
            });
    });
}