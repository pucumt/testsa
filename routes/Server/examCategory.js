var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ExamCategory = model.examCategory,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/examCategoryList', checkLogin);
    app.get('/admin/examCategoryList', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        ExamCategory.getFiltersWithPage(page, {}).then(function (result) {
            res.render('Server/examCategoryList.html', {
                title: '>测试类别',
                user: req.session.admin,
                examCategorys: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/examCategory/add', checkLogin);
    app.post('/admin/examCategory/add', function (req, res) {
        ExamCategory.create({
                name: req.body.name
            })
            .then(function (examCategory) {
                res.jsonp(examCategory);
            });
    });

    app.post('/admin/examCategory/edit', checkLogin);
    app.post('/admin/examCategory/edit', function (req, res) {
        ExamCategory.update({
                name: req.body.name
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (examCategory) {
                res.jsonp(examCategory);
            });
    });

    app.post('/admin/examCategory/delete', checkLogin);
    app.post('/admin/examCategory/delete', function (req, res) {
        ExamCategory.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.get('/admin/examCategory/getAllWithoutPage', checkLogin);
    app.get('/admin/examCategory/getAllWithoutPage', function (req, res) {
        ExamCategory.getFilters({})
            .then(function (data) {
                res.jsonp(data);
            });
    });
}