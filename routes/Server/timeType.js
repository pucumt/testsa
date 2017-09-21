var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    TimeType = model.timeType,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/timeType', checkLogin);
    app.get('/admin/timeType', function (req, res) {
        res.render('Server/timeTypeList.html', {
            title: '>上课时间段列表',
            user: req.session.admin
        });
    });

    app.post('/admin/timeType/add', checkLogin);
    app.post('/admin/timeType/add', function (req, res) {
        TimeType.create({
            name: req.body.name,
            isChecked: true
        }).then(function (timeType) {
            res.jsonp(timeType);
        });
    });

    app.post('/admin/timeType/edit', checkLogin);
    app.post('/admin/timeType/edit', function (req, res) {
        TimeType.update({
            name: req.body.name
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (timeType) {
            res.jsonp(timeType);
        });
    });

    app.post('/admin/timeType/delete', checkLogin);
    app.post('/admin/timeType/delete', function (req, res) {
        TimeType.update({
            isDeleted: true
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/timeTypeList/search', checkLogin);
    app.post('/admin/timeTypeList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        TimeType.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                timeTypes: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/timeType/startAll', checkLogin);
    app.post('/admin/timeType/startAll', function (req, res) {
        TimeType.update({
            isChecked: true
        }, {
            where: {
                _id: {
                    $in: JSON.parse(req.body.ids)
                }
            }
        }).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/timeType/stopAll', checkLogin);
    app.post('/admin/timeType/stopAll', function (req, res) {
        TimeType.update({
            isChecked: false
        }, {
            where: {
                _id: {
                    $in: JSON.parse(req.body.ids)
                }
            }
        }).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });
}