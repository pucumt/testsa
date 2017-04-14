var ExamArea = require('../../models/examArea.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/examAreaList', checkLogin);
    app.get('/admin/examAreaList', function(req, res) {
        res.render('Server/examAreaList.html', {
            title: '>考区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/examArea/add', checkLogin);
    app.post('/admin/examArea/add', function(req, res) {
        var examArea = new ExamArea({
            name: req.body.name,
            address: req.body.address
        });

        examArea.save(function(err, examArea) {
            if (err) {
                examArea = {};
            }
            res.jsonp(examArea);
        });
    });

    app.post('/admin/examArea/edit', checkLogin);
    app.post('/admin/examArea/edit', function(req, res) {
        var examArea = new ExamArea({
            name: req.body.name,
            address: req.body.address
        });

        examArea.update(req.body.id, function(err, examArea) {
            if (err) {
                examArea = {};
            }
            res.jsonp(examArea);
        });
    });

    app.post('/admin/examArea/delete', checkLogin);
    app.post('/admin/examArea/delete', function(req, res) {
        ExamArea.delete(req.body.id, function(err, examArea) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examAreaList/search', checkLogin);
    app.post('/admin/examAreaList/search', function(req, res) {

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

        ExamArea.getAll(null, page, filter, function(err, examAreas, total) {
            if (err) {
                examAreas = [];
            }
            res.jsonp({
                examAreas: examAreas,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + examAreas.length) == total
            });
        });
    });

    app.get('/admin/examAreaList/getAllWithoutPage', checkLogin);
    app.get('/admin/examAreaList/getAllWithoutPage', function(req, res) {
        ExamArea.getAllWithoutPage()
            .then(function(examAreas) {
                res.jsonp(examAreas);
            })
            .catch((err) => {
                console.log('errored');
            });
    });
}