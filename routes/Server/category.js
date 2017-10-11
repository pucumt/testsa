var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Category = model.category,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/categoryList', checkLogin);
    app.get('/admin/categoryList', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Category.getFiltersWithPage(page, {}).then(function (result) {
            res.render('Server/categoryList.html', {
                title: '>课程难度',
                user: req.session.admin,
                categorys: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/category/add', checkLogin);
    app.post('/admin/category/add', function (req, res) {
        Category.create({
            name: req.body.name,
            grade: req.body.grade
        }).then(function (category) {
            res.jsonp(category);
        });
    });

    app.post('/admin/category/edit', checkLogin);
    app.post('/admin/category/edit', function (req, res) {
        Category.update({
                name: req.body.name,
                grade: req.body.grade
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (category) {
                res.jsonp(category);
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.post('/admin/category/delete', checkLogin);
    app.post('/admin/category/delete', function (req, res) {
        Category.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (category) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.get('/admin/category/all', checkLogin);
    app.get('/admin/category/all', function (req, res) {
        Category.getFilters({})
            .then(function (categories) {
                res.jsonp(categories);
            });
    });
}