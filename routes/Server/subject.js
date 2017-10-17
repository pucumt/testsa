var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Subject = model.subject,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/subjectList', checkLogin);
    app.get('/admin/subjectList', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Subject.getFiltersWithPage(page, {}).then(function (result) {
            res.render('Server/subjectList.html', {
                title: '>课程科目',
                user: req.session.admin,
                subjects: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/subject/add', checkLogin);
    app.post('/admin/subject/add', function (req, res) {
        Subject.create({
                name: req.body.name,
                createdBy: req.session.admin._id
            })
            .then(function (subject) {
                res.jsonp(subject);
            });
    });

    app.post('/admin/subject/edit', checkLogin);
    app.post('/admin/subject/edit', function (req, res) {
        Subject.update({
                name: req.body.name
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (subject) {
                res.jsonp(subject);
            });
    });

    app.post('/admin/subject/delete', checkLogin);
    app.post('/admin/subject/delete', function (req, res) {
        Subject.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.get('/admin/subject/getAllWithoutPage', checkLogin);
    app.get('/admin/subject/getAllWithoutPage', function (req, res) {
        Subject.getFilters({})
            .then(function (subjects) {
                res.jsonp(subjects);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });
}