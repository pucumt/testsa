var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    WeekType = model.weekType,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/weekType', checkLogin);
    app.get('/admin/weekType', function (req, res) {
        res.render('Server/weekTypeList.html', {
            title: '>星期几的课程',
            user: req.session.admin
        });
    });

    app.post('/admin/weekType/add', checkLogin);
    app.post('/admin/weekType/add', function (req, res) {
        WeekType.create({
                name: req.body.name,
                isChecked: true,
                createdBy: req.session.admin._id
            })
            .then(function (weekType) {
                res.jsonp(weekType);
            });
    });

    app.post('/admin/weekType/edit', checkLogin);
    app.post('/admin/weekType/edit', function (req, res) {
        WeekType.update({
                name: req.body.name
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (weekType) {
                res.jsonp(weekType);
            });
    });

    app.post('/admin/weekType/delete', checkLogin);
    app.post('/admin/weekType/delete', function (req, res) {
        WeekType.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/weekTypeList/search', checkLogin);
    app.post('/admin/weekTypeList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        WeekType.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                weekTypes: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/weekType/startAll', checkLogin);
    app.post('/admin/weekType/startAll', function (req, res) {
        WeekType.update({
                isChecked: true
            }, {
                where: {
                    _id: {
                        $in: JSON.parse(req.body.ids)
                    }
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/weekType/stopAll', checkLogin);
    app.post('/admin/weekType/stopAll', function (req, res) {
        WeekType.update({
                isChecked: false
            }, {
                where: {
                    _id: {
                        $in: JSON.parse(req.body.ids)
                    }
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            });
    });
}