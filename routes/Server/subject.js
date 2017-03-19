var Subject = require('../../models/subject.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/subjectList', checkLogin);
    app.get('/admin/subjectList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Subject.getAll(null, page, {}, function(err, subjects, total) {
            if (err) {
                subjects = [];
            }
            res.render('Server/subjectList.html', {
                title: '>课程科目',
                user: req.session.user,
                subjects: subjects,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + subjects.length) == total
            });
        });
    });

    app.post('/admin/subject/add', checkLogin);
    app.post('/admin/subject/add', function(req, res) {
        var subject = new Subject({
            name: req.body.name
        });

        subject.save(function(err, subject) {
            if (err) {
                subject = {};
            }
            res.jsonp(subject);
        });
    });

    app.post('/admin/subject/edit', checkLogin);
    app.post('/admin/subject/edit', function(req, res) {
        var subject = new Subject({
            name: req.body.name
        });

        subject.update(req.body.id, function(err, subject) {
            if (err) {
                subject = {};
            }
            res.jsonp(subject);
        });
    });

    app.post('/admin/subject/delete', checkLogin);
    app.post('/admin/subject/delete', function(req, res) {
        Subject.delete(req.body.id, function(err, subject) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
}