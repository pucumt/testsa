var User = require('../../models/user.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/adminList', checkLogin);
    app.get('/admin/adminList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        User.getAll(null, page, {}, function(err, users, total) {
            if (err) {
                users = [];
            }
            res.render('Server/adminList.html', {
                title: '>管理员设置',
                user: req.session.admin,
                users: users
            });
        });
    });

    app.post('/admin/user/add', checkLogin);
    app.post('/admin/user/add', function(req, res) {
        var user = new User({
            name: req.body.username,
            password: req.body.password
        });

        user.save(function(err, user) {
            if (err) {
                user = {};
            }
            res.jsonp(user);
        });
    });

    app.post('/admin/user/edit', checkLogin);
    app.post('/admin/user/edit', function(req, res) {
        var user = new User({
            name: req.body.username,
            password: req.body.password
        });

        user.update(function(err, user) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp(user);
        });
    });

    app.post('/admin/user/delete', checkLogin);
    app.post('/admin/user/delete', function(req, res) {
        User.delete(req.body.username, function(err, user) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/user/find', checkLogin);
    app.post('/admin/user/find', function(req, res) {
        User.get(req.body.username, function(err, user) {
            if (err) {
                user = {};
            }
            if (user) {
                res.jsonp({ "valid": false });
            } else {
                res.jsonp({ "valid": true });
            }
        });
    });
}