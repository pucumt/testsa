var TrainClass = require('../../models/trainClass.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/trainClassList', checkLogin);
    app.get('/admin/trainClassList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        TrainClass.getAll(null, page, {}, function(err, trainClasss, total) {
            if (err) {
                trainClasss = [];
            }
            res.render('Server/trainClassList.html', {
                title: '>课程设置',
                user: req.session.user,
                trainClasss: trainClasss,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + trainClasss.length) == total
            });
        });
    });

    app.post('/admin/trainClass/add', checkLogin);
    app.post('/admin/trainClass/add', function(req, res) {
        var trainClass = new TrainClass({
            name: req.body.name,
            address: req.body.address
        });

        trainClass.save(function(err, trainClass) {
            if (err) {
                trainClass = {};
            }
            res.jsonp(trainClass);
        });
    });

    app.post('/admin/trainClass/edit', checkLogin);
    app.post('/admin/trainClass/edit', function(req, res) {
        var trainClass = new TrainClass({
            name: req.body.name,
            address: req.body.address
        });

        trainClass.update(req.body.id, function(err, trainClass) {
            if (err) {
                trainClass = {};
            }
            res.jsonp(trainClass);
        });
    });

    app.post('/admin/trainClass/delete', checkLogin);
    app.post('/admin/trainClass/delete', function(req, res) {
        TrainClass.delete(req.body.id, function(err, trainClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
}