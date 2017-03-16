var User = require('../../models/user.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/adminList', checkLogin);
    app.get('/admin/adminList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        User.get20(null, page, {}, function(err, users, total) {
            if (err) {
                users = [];
            }
            res.render('Server/adminList.html', {
                title: '管理员列表',
                user: req.session.user,
                users: users,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 20 + users.length) == total
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
                user = {};
            }
            res.jsonp(user);
        });
    });

    app.get('/admin/user/delete/:id', checkLogin);
    app.get('/admin/user/delete/:id', function(req, res) {
        User.delete(req.params.id, function() {
            res.redirect('/admin/userList'); //发表成功跳转到主页
        });
    });

    app.get('/admin/user/:id', checkLogin);
    app.get('/admin/user/:id', function(req, res) {
        User.getOne(req.params.id, function(err, user) {
            if (err) {
                user = {};
            }
            res.render('Server/user', {
                title: '用户',
                user: user
            });
        });
    });
    app.post('/admin/user/:id', checkLogin);
    app.post('/admin/user/:id', function(req, res) {
        var currentUser = req.session.user,
            user = new User({
                name: req.body.name,
                password: req.body.password,
                email: req.body.email
            });
        user.update(req.params.id, function(err) {
            if (err) {
                return res.redirect('/admin/user/' + req.params.id);
            }
            res.redirect('/admin/user/' + req.params.id);
        });
    });
}