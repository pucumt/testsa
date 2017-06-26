var AbsentStudents = require('../../models/absentStudents.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/absentStudentsList', checkLogin);
    app.get('/admin/absentStudentsList', function(req, res) {
        res.render('Server/absentStudentsList.html', {
            title: '>缺席学生列表',
            user: req.session.admin
        });
    });

    app.post('/admin/absentStudents/add', checkLogin);
    app.post('/admin/absentStudents/add', function(req, res) {
        var absentStudents = new AbsentStudents({
            name: req.body.name,
            address: req.body.address
        });

        absentStudents.save(function(err, absentStudents) {
            if (err) {
                absentStudents = {};
            }
            res.jsonp(absentStudents);
        });
    });

    app.post('/admin/absentStudents/edit', checkLogin);
    app.post('/admin/absentStudents/edit', function(req, res) {
        var absentStudents = new AbsentStudents({
            name: req.body.name,
            address: req.body.address
        });

        absentStudents.update(req.body.id, function(err, absentStudents) {
            if (err) {
                absentStudents = {};
            }
            res.jsonp(absentStudents);
        });
    });

    app.post('/admin/absentStudents/delete', checkLogin);
    app.post('/admin/absentStudents/delete', function(req, res) {
        AbsentStudents.delete(req.body.id, function(err, absentStudents) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/absentStudentsList/search', checkLogin);
    app.post('/admin/absentStudentsList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name) {
            var reg = new RegExp(req.body.name, 'i')
            filter.name = {
                $regex: reg
            };
        }

        AbsentStudents.getAll(null, page, filter, function(err, absentStudentss, total) {
            if (err) {
                absentStudentss = [];
            }
            res.jsonp({
                absentStudentss: absentStudentss,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + absentStudentss.length) == total
            });
        });
    });
}