var login = require('./login.js'),
    logout = require('./logout.js'),
    //post = require('./post.js'),
    user = require('./user.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin', checkLogin)
    app.get('/admin', function(req, res) {
        res.render('Server/index.html', {
            title: '主页',
            user: req.session.user
        });
    });

    login(app);

    logout(app);

    //post(app);

    user(app);
};