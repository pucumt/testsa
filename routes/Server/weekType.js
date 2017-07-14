var WeekType = require('../../models/weekType.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/weekType', checkLogin);
    app.get('/admin/weekType', function(req, res) {
        res.render('Server/weekTypeList.html', {
            title: '>星期几的课程',
            user: req.session.admin
        });
    });

    app.post('/admin/weekType/add', checkLogin);
    app.post('/admin/weekType/add', function(req, res) {
        var weekType = new WeekType({
            name: req.body.name,
            isChecked: true
        });

        weekType.save(function(err, weekType) {
            if (err) {
                weekType = {};
            }
            res.jsonp(weekType);
        });
    });

    app.post('/admin/weekType/edit', checkLogin);
    app.post('/admin/weekType/edit', function(req, res) {
        var weekType = new WeekType({
            name: req.body.name
        });

        weekType.update(req.body.id, function(err, weekType) {
            if (err) {
                weekType = {};
            }
            res.jsonp(weekType);
        });
    });

    app.post('/admin/weekType/delete', checkLogin);
    app.post('/admin/weekType/delete', function(req, res) {
        WeekType.delete(req.body.id, function(err, weekType) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/weekTypeList/search', checkLogin);
    app.post('/admin/weekTypeList/search', function(req, res) {

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

        WeekType.getAll(null, page, filter, function(err, weekTypes, total) {
            if (err) {
                weekTypes = [];
            }
            res.jsonp({
                weekTypes: weekTypes,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + weekTypes.length) == total
            });
        });
    });

    app.post('/admin/weekType/startAll', checkLogin);
    app.post('/admin/weekType/startAll', function(req, res) {
        WeekType.updateBatch({
                _id: { $in: JSON.parse(req.body.ids) }
            }, {
                isChecked: true
            })
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });

    app.post('/admin/weekType/stopAll', checkLogin);
    app.post('/admin/weekType/stopAll', function(req, res) {
        WeekType.updateBatch({
                _id: { $in: JSON.parse(req.body.ids) }
            }, {
                isChecked: false
            })
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });
}