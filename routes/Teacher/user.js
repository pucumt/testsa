var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Teacher = model.teacher,
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function (app) {
    app.get('/Teacher/personalCenter', checkLogin);
    app.get('/Teacher/personalCenter', function (req, res) {
        res.render('Teacher/personalCenter.html', {
            title: '老师',
            user: req.session.teacher
        });
    });

    app.get('/Teacher/personalCenter/exit', checkLogin);
    app.get('/Teacher/personalCenter/exit', function (req, res) {
        delete req.session.teacher;
        req.session.originalUrl = "/Teacher/personalCenter";
        res.redirect('/Teacher/login');
    });

    app.get('/Teacher/personalCenter/resetPWD', checkLogin);
    app.get('/Teacher/personalCenter/resetPWD', function (req, res) {
        res.render('Teacher/personalCenter_resetPWD.html', {
            title: '个人中心',
            user: req.session.teacher
        });
    });

    app.post('/Teacher/personalCenter/resetPWD', checkJSONLogin);
    app.post('/Teacher/personalCenter/resetPWD', function (req, res) {
        var currentUser = req.session.teacher;
        if (currentUser.password != req.body.oldPassword) {
            res.jsonp({
                error: "旧密码不正确"
            });
            return;
        }
        Teacher.update({
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