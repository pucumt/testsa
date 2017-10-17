var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Grade = model.grade,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/gradeList', checkLogin);
    app.get('/admin/gradeList', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Grade.getFiltersWithPage(page, {})
            .then(function (result) {
                res.render('Server/gradeList.html', {
                    title: '>年级设置',
                    user: req.session.admin,
                    grades: result.rows,
                    total: result.count
                });
            });
    });

    app.post('/admin/grade/add', checkLogin);
    app.post('/admin/grade/add', function (req, res) {
        Grade.create({
            name: req.body.name,
            sequence: req.body.sequence,
            createdBy: req.session.admin._id
        }).then(function (grade) {
            res.jsonp(grade);
        });
    });

    app.post('/admin/grade/edit', checkLogin);
    app.post('/admin/grade/edit', function (req, res) {
        Grade.update({
            name: req.body.name,
            sequence: req.body.sequence
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (grade) {
            res.jsonp(grade);
        });
    });

    app.post('/admin/grade/delete', checkLogin);
    app.post('/admin/grade/delete', function (req, res) {
        Grade.update({
            isDeleted: true
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (grade) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.get('/admin/grade/getAll', checkLogin);
    app.get('/admin/grade/getAll', function (req, res) {
        Grade.getFilters({}).then(function (grades) {
            res.jsonp(grades);
        });
    });

    app.get('/admin/grade/settings/:id', checkLogin);
    app.get('/admin/grade/settings/:id', function (req, res) {
        Grade.getFilter({
            _id: req.params.id
        }).then(function (grade) {
            if (grade) {
                res.render('Server/gradeSubjectRelationList.html', {
                    title: '>' + grade.name + '>年级科目',
                    user: req.session.admin,
                    gradeId: req.params.id
                });
            }
        });
    });
}