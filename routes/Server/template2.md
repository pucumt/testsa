var #Name# = require('../../models/#name#.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/#name#List', checkLogin);
    app.get('/admin/#name#List', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        #Name#.getAll(null, page, {}, function(err, #name#s, total) {
            if (err) {
                #name#s = [];
            }
            res.render('Server/#name#List.html', {
                title: '>校区列表',
                user: req.session.admin,
                #name#s: #name#s,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + #name#s.length) == total
            });
        });
    });

    app.post('/admin/#name#/add', checkLogin);
    app.post('/admin/#name#/add', function(req, res) {
        var #name# = new #Name#({
            name: req.body.name,
            address: req.body.address
        });

        #name#.save(function(err, #name#) {
            if (err) {
                #name# = {};
            }
            res.jsonp(#name#);
        });
    });

    app.post('/admin/#name#/edit', checkLogin);
    app.post('/admin/#name#/edit', function(req, res) {
        var #name# = new #Name#({
            name: req.body.name,
            address: req.body.address
        });

        #name#.update(req.body.id, function(err, #name#) {
            if (err) {
                #name# = {};
            }
            res.jsonp(#name#);
        });
    });

    app.post('/admin/#name#/delete', checkLogin);
    app.post('/admin/#name#/delete', function(req, res) {
        #Name#.delete(req.body.id, function(err, #name#) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
}