var TimeType = require('../../models/timeType.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/timeType', checkLogin);
    app.get('/admin/timeType', function(req, res) {
        res.render('Server/timeTypeList.html', {
            title: '>上课时间段列表',
            user: req.session.admin
        });
    });

    app.post('/admin/timeType/add', checkLogin);
    app.post('/admin/timeType/add', function(req, res) {
        var timeType = new TimeType({
            name: req.body.name,
            isChecked: true
        });

        timeType.save(function(err, timeType) {
            if (err) {
                timeType = {};
            }
            res.jsonp(timeType);
        });
    });

    app.post('/admin/timeType/edit', checkLogin);
    app.post('/admin/timeType/edit', function(req, res) {
        var timeType = new TimeType({
            name: req.body.name
        });

        timeType.update(req.body.id, function(err, timeType) {
            if (err) {
                timeType = {};
            }
            res.jsonp(timeType);
        });
    });

    app.post('/admin/timeType/delete', checkLogin);
    app.post('/admin/timeType/delete', function(req, res) {
        TimeType.delete(req.body.id, function(err, timeType) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/timeTypeList/search', checkLogin);
    app.post('/admin/timeTypeList/search', function(req, res) {

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

        TimeType.getAll(null, page, filter, function(err, timeTypes, total) {
            if (err) {
                timeTypes = [];
            }
            res.jsonp({
                timeTypes: timeTypes,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + timeTypes.length) == total
            });
        });
    });

    app.post('/admin/timeType/startAll', checkLogin);
    app.post('/admin/timeType/startAll', function(req, res) {
        TimeType.updateBatch({
                _id: { $in: JSON.parse(req.body.ids) }
            }, {
                isChecked: true
            })
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });

    app.post('/admin/timeType/stopAll', checkLogin);
    app.post('/admin/timeType/stopAll', function(req, res) {
        TimeType.updateBatch({
                _id: { $in: JSON.parse(req.body.ids) }
            }, {
                isChecked: false
            })
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });
}