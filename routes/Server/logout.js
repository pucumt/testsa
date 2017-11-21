var auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {

    app.get('/admin/logout', function (req, res) {
        var role = 10;
        if (req.session.admin) {
            role = req.session.admin.role;
            req.session.admin = null;
        } else if (req.session.adminRollCall) {
            req.session.adminRollCall = null;
        }

        if (role == 11 || role == 20) {
            res.redirect('/Teacher/login'); //登出成功后跳转到登录页面
        } else {
            res.redirect('/admin/login'); //登出成功后跳转到登录页面
        }
    });
}