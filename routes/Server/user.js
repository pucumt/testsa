var User = require('../../models/user.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/adminList', checkLogin);
    app.get('/admin/adminList', function(req, res) {
        res.render('Server/adminList.html', {
            title: '>管理员设置',
            user: req.session.admin
        });
    });

    app.post('/admin/user/add', checkLogin);
    app.post('/admin/user/add', function(req, res) {
        var user = new User({
            name: req.body.username,
            password: req.body.password,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea,
            role: req.body.role
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
            password: req.body.password,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea,
            role: req.body.role
        });

        user.update(function(err, user) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp(user);
        });
    });

    app.post('/admin/user/setRole', checkLogin);
    app.post('/admin/user/setRole', function(req, res) {
        var user = new User({
            name: req.body.username,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea,
            role: req.body.role
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

    app.post('/admin/user/SetSuper', checkLogin);
    app.post('/admin/user/SetSuper', function(req, res) {
        var user = new User({
            name: "bfbadmin",
            role: 0
        });

        user.update(function(err, user) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/adminList/search', checkLogin);
    app.post('/admin/adminList/search', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;

        var filter = {};
        if (req.body.name) {
            var reg = new RegExp(req.body.name, 'i')
            filter.name = {
                $regex: reg
            };
        }
        //查询并返回第 page 页的 20 篇文章
        User.getAll(null, page, filter, function(err, users, total) {
            if (err) {
                users = [];
            }
            res.jsonp({
                users: users,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + users.length) == total
            });
        });
    });
}