var AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/adminEnrollTrainList', checkLogin);
    app.get('/admin/adminEnrollTrainList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        AdminEnrollTrain.getAll(null, page, {}, function(err, adminEnrollTrains, total) {
            if (err) {
                adminEnrollTrains = [];
            }
            res.render('Server/adminEnrollTrainList.html', {
                title: '>课程报名',
                user: req.session.user,
                adminEnrollTrains: adminEnrollTrains,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + adminEnrollTrains.length) == total
            });
        });
    });

    app.post('/admin/adminEnrollTrain/add', checkLogin);
    app.post('/admin/adminEnrollTrain/add', function(req, res) {
        var adminEnrollTrain = new AdminEnrollTrain({
            name: req.body.name,
            address: req.body.address
        });

        adminEnrollTrain.save(function(err, adminEnrollTrain) {
            if (err) {
                adminEnrollTrain = {};
            }
            res.jsonp(adminEnrollTrain);
        });
    });

    app.post('/admin/adminEnrollTrain/edit', checkLogin);
    app.post('/admin/adminEnrollTrain/edit', function(req, res) {
        var adminEnrollTrain = new AdminEnrollTrain({
            name: req.body.name,
            address: req.body.address
        });

        adminEnrollTrain.update(req.body.id, function(err, adminEnrollTrain) {
            if (err) {
                adminEnrollTrain = {};
            }
            res.jsonp(adminEnrollTrain);
        });
    });

    app.post('/admin/adminEnrollTrain/delete', checkLogin);
    app.post('/admin/adminEnrollTrain/delete', function(req, res) {
        AdminEnrollTrain.delete(req.body.id, function(err, adminEnrollTrain) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
}