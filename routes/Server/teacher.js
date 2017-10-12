var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Teacher = model.teacher,
    auth = require("./auth"),
    crypto = require('crypto'),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/teacherList', checkLogin);
    app.get('/admin/teacherList', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 14 篇文章
        Teacher.getFiltersWithPage(page, {}).then(function (result) {
            res.render('Server/teacherList.html', {
                title: '>老师设置',
                user: req.session.admin,
                teachers: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.get('/admin/batchAddTeacher', checkLogin);
    app.get('/admin/batchAddTeacher', function (req, res) {
        res.render('Server/batchAddTeacher.html', {
            title: '>批量添加老师',
            user: req.session.admin
        });
    });

    app.post('/admin/teacher/add', checkLogin);
    app.post('/admin/teacher/add', function (req, res) {
        var md5 = crypto.createHash('md5');
        Teacher.create({
                name: req.body.name,
                engName: req.body.engName,
                mobile: req.body.mobile,
                address: req.body.address,
                password: md5.update("111111").digest('hex')
            })
            .then(function (teacher) {
                res.jsonp(teacher);
            });
    });

    app.post('/admin/teacher/edit', checkLogin);
    app.post('/admin/teacher/edit', function (req, res) {
        Teacher.update({
                name: req.body.name,
                engName: req.body.engName,
                mobile: req.body.mobile,
                address: req.body.address
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (teacher) {
                res.jsonp(teacher);
            });
    });

    app.post('/admin/teacher/delete', checkLogin);
    app.post('/admin/teacher/delete', function (req, res) {
        Teacher.update({
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

    app.get('/admin/teacher/withoutpage', checkLogin);
    app.get('/admin/teacher/withoutpage', function (req, res) {
        Teacher.getFilters({})
            .then(function (teachers) {
                res.jsonp(teachers);
            });
    });

    app.post('/admin/teacher/search', checkLogin);
    app.post('/admin/teacher/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        Teacher.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                teachers: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/teacher/reset', checkLogin);
    app.post('/admin/teacher/reset', function (req, res) {
        var md5 = crypto.createHash('md5');
        Teacher.update({
                password: password = md5.update("111111").digest('hex')
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
}