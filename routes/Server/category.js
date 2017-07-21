var Category = require('../../models/category.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/categoryList', checkLogin);
    app.get('/admin/categoryList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Category.getAll(null, page, {}, function(err, categorys, total) {
            if (err) {
                categorys = [];
            }
            res.render('Server/categoryList.html', {
                title: '>课程难度',
                user: req.session.admin,
                categorys: categorys,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + categorys.length) == total
            });
        });
    });

    app.post('/admin/category/add', checkLogin);
    app.post('/admin/category/add', function(req, res) {
        var category = new Category({
            name: req.body.name,
            grade: req.body.grade
        });

        category.save(function(err, category) {
            if (err) {
                category = {};
            }
            res.jsonp(category);
        });
    });

    app.post('/admin/category/edit', checkLogin);
    app.post('/admin/category/edit', function(req, res) {
        var category = new Category({
            name: req.body.name,
            grade: req.body.grade
        });

        category.update(req.body.id, function(err, category) {
            if (err) {
                category = {};
            }
            res.jsonp(category);
        });
    });

    app.post('/admin/category/delete', checkLogin);
    app.post('/admin/category/delete', function(req, res) {
        Category.delete(req.body.id, function(err, category) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.get('/admin/category/all', checkLogin);
    app.get('/admin/category/all', function(req, res) {
        Category.getAllWithoutPage({}).then(function(categories) {
            res.jsonp(categories);
        });
    });
}