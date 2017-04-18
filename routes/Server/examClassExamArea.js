var ExamClassExamArea = require('../../models/examClassExamArea.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/examClassExamAreaList', checkLogin);
    app.get('/admin/examClassExamAreaList', function(req, res) {
        res.render('Server/examClassExamAreaList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/examClassExamArea/add', checkLogin);
    app.post('/admin/examClassExamArea/add', function(req, res) {
        var examClassExamArea = new ExamClassExamArea({
            name: req.body.name,
            address: req.body.address
        });

        examClassExamArea.save(function(err, examClassExamArea) {
            if (err) {
                examClassExamArea = {};
            }
            res.jsonp(examClassExamArea);
        });
    });

    app.post('/admin/examClassExamArea/edit', checkLogin);
    app.post('/admin/examClassExamArea/edit', function(req, res) {
        var examClassExamArea = new ExamClassExamArea({
            name: req.body.name,
            address: req.body.address
        });

        examClassExamArea.update(req.body.id, function(err, examClassExamArea) {
            if (err) {
                examClassExamArea = {};
            }
            res.jsonp(examClassExamArea);
        });
    });

    app.post('/admin/examClassExamArea/delete', checkLogin);
    app.post('/admin/examClassExamArea/delete', function(req, res) {
        ExamClassExamArea.delete(req.body.id, function(err, examClassExamArea) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClassExamAreaList/search', checkLogin);
    app.post('/admin/examClassExamAreaList/search', function(req, res) {

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

        ExamClassExamArea.getAll(null, page, filter, function(err, examClassExamAreas, total) {
            if (err) {
                examClassExamAreas = [];
            }
            res.jsonp({
                examClassExamAreas: examClassExamAreas,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + examClassExamAreas.length) == total
            });
        });
    });
}