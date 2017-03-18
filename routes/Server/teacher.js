var Teacher = require('../../models/teacher.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/teacherList', checkLogin);
    app.get('/admin/teacherList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 14 篇文章
        Teacher.getAll(null, page, {}, function(err, teachers, total) {
            if (err) {
                teachers = [];
            }
            res.render('Server/teacherList.html', {
                title: '>老师设置',
                user: req.session.user,
                teachers: teachers,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + teachers.length) == total
            });
        });
    });

    app.post('/admin/teacher/add', checkLogin);
    app.post('/admin/teacher/add', function(req, res) {
        var teacher = new Teacher({
            name: req.body.name,
            mobile: req.body.mobile,
            address: req.body.address
        });

        teacher.save(function(err, teacher) {
            if (err) {
                teacher = {};
            }
            res.jsonp(teacher);
        });
    });

    app.post('/admin/teacher/edit', checkLogin);
    app.post('/admin/teacher/edit', function(req, res) {
        var teacher = new Teacher({
            name: req.body.name,
            mobile: req.body.mobile,
            address: req.body.address
        });

        teacher.update(req.body.id, function(err, teacher) {
            if (err) {
                teacher = {};
            }
            res.jsonp(teacher);
        });
    });

    app.post('/admin/teacher/delete', checkLogin);
    app.post('/admin/teacher/delete', function(req, res) {
        Teacher.delete(req.body.id, function(err, teacher) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
}