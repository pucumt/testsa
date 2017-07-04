var StudentInfo = require('../../models/studentInfo.js'),
    CouponAssign = require('../../models/couponAssign.js'),
    StudentAccount = require('../../models/studentAccount.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function(app) {
    app.get('/personalCenter', checkLogin);
    app.get('/personalCenter', function(req, res) {
        var currentUser = req.session.user;
        //StudentInfo.getFilter({ accountId: currentUser._id })
        //.then(function(students) {
        res.render('Client/personalCenter.html', {
            title: '个人中心',
            user: req.session.user,
            // students: students
        });
        // });
    });

    app.get('/personalCenter/resetPWD', checkLogin);
    app.get('/personalCenter/resetPWD', function(req, res) {
        var currentUser = req.session.user;
        //StudentInfo.getFilter({ accountId: currentUser._id })
        //.then(function(students) {
        res.render('Client/personalCenter_resetPWD.html', {
            title: '个人中心',
            user: req.session.user,
            // students: students
        });
        // });
    });

    app.post('/personalCenter/resetPWD', checkJSONLogin);
    app.post('/personalCenter/resetPWD', function(req, res) {
        var currentUser = req.session.user;
        if (currentUser.password != req.body.oldPassword) {
            res.jsonp({ error: "旧密码不正确" });
            return;
        }
        var studentAccount = new StudentAccount({
            password: req.body.password
        });
        studentAccount.update(currentUser._id, function(error, account) {
            currentUser.password = req.body.password;
            res.jsonp({ sucess: true });
            return;
        });
    });
}