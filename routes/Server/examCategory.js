var ExamCategory = require('../../models/examCategory.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/examCategoryList', checkLogin);
    app.get('/admin/examCategoryList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        ExamCategory.getAll(null, page, {}, function(err, examCategorys, total) {
            if (err) {
                examCategorys = [];
            }
            res.render('Server/examCategoryList.html', {
                title: '>测试类别',
                user: req.session.user,
                examCategorys: examCategorys,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + examCategorys.length) == total
            });
        });
    });

    app.post('/admin/examCategory/add', checkLogin);
    app.post('/admin/examCategory/add', function(req, res) {
        var examCategory = new ExamCategory({
            name: req.body.name
        });

        examCategory.save(function(err, examCategory) {
            if (err) {
                examCategory = {};
            }
            res.jsonp(examCategory);
        });
    });

    app.post('/admin/examCategory/edit', checkLogin);
    app.post('/admin/examCategory/edit', function(req, res) {
        var examCategory = new ExamCategory({
            name: req.body.name
        });

        examCategory.update(req.body.id, function(err, examCategory) {
            if (err) {
                examCategory = {};
            }
            res.jsonp(examCategory);
        });
    });

    app.post('/admin/examCategory/delete', checkLogin);
    app.post('/admin/examCategory/delete', function(req, res) {
        ExamCategory.delete(req.body.id, function(err, examCategory) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.get('/admin/examCategory/getAllWithoutPage', checkLogin);
    app.get('/admin/examCategory/getAllWithoutPage', function(req, res) {
        ExamCategory.getAllWithoutPage()
            .then(function(data) {
                res.jsonp(data);
            });
    });
}