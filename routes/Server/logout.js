var auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {

    app.get('/admin/logout', function (req, res) {
        if (req.session.admin) {
            req.session.admin = null;
        } else if (req.session.adminRollCall) {
            req.session.adminRollCall = null;
        }

        if (user.role == 11 || user.role == 20) {
            res.redirect('/Teacher/login'); //登出成功后跳转到登录页面
        } else {
            res.redirect('/admin/login'); //登出成功后跳转到登录页面
        }
    });
}