var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    StudentInfo = model.studentInfo,
    CouponAssign = model.couponAssign,
    StudentAccount = model.studentAccount,
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
}