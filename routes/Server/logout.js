var auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/logout', checkLogin);
    app.get('/admin/logout', function(req, res) {
        req.session.admin = null;
        res.redirect('/admin/login'); //登出成功后跳转到登录页面
    });
}