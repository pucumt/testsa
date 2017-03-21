var ExamClass = require('../../models/examClass.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/examClassList', checkLogin);
    app.get('/admin/examClassList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        ExamClass.getAll(null, page, {}, function(err, examClasss, total) {
            if (err) {
                examClasss = [];
            }
            res.render('Server/examClassList.html', {
                title: '>测试设置',
                user: req.session.user,
                examClasss: examClasss,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + examClasss.length) == total
            });
        });
    });

    app.post('/admin/examClass/add', checkLogin);
    app.post('/admin/examClass/add', function(req, res) {
        var examClass = new ExamClass({
            name: req.body.name,
            examDate: req.body.examDate,
            examTime: req.body.examTime,
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName,
            examCount: req.body.examCount,
            isWeixin: 0
        });

        examClass.save(function(err, examClass) {
            if (err) {
                examClass = {};
            }
            res.jsonp(examClass);
        });
    });

    app.post('/admin/examClass/edit', checkLogin);
    app.post('/admin/examClass/edit', function(req, res) {
        var examClass = new ExamClass({
            name: req.body.name,
            examDate: req.body.examDate,
            examTime: req.body.examTime,
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName,
            examCount: req.body.examCount,
        });

        examClass.update(req.body.id, function(err, examClass) {
            if (err) {
                examClass = {};
            }
            res.jsonp(examClass);
        });
    });

    app.post('/admin/examClass/delete', checkLogin);
    app.post('/admin/examClass/delete', function(req, res) {
        ExamClass.delete(req.body.id, function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClass/publish', checkLogin);
    app.post('/admin/examClass/publish', function(req, res) {
        ExamClass.publish(req.body.id, function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClass/unPublish', checkLogin);
    app.post('/admin/examClass/unPublish', function(req, res) {
        ExamClass.unPublish(req.body.id, function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
}