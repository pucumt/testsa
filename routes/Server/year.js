var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Year = model.year,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    function checkcurrentYear() {
        Year.getFilter({
                isCurrentYear: true
            })
            .then(function (year) {
                if (year) {
                    global.currentYear = year.toJSON();
                }
            });
    };
    checkcurrentYear();

    app.get('/admin/yearList', checkLogin);
    app.get('/admin/yearList', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Year.getFiltersWithPage(page, {})
            .then(function (result) {
                res.render('Server/yearList.html', {
                    title: '>年度设置',
                    user: req.session.admin,
                    years: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
    });

    app.post('/admin/year/add', checkLogin);
    app.post('/admin/year/add', function (req, res) {
        var option = {
            name: req.body.name,
            sequence: req.body.sequence,
            createdBy: req.session.admin._id
        };
        if (req.body.iscurrent) {
            // clear and save, so use transaction
            model.db.sequelize.transaction(function (t1) {
                    return Year.update({
                            isCurrentYear: false
                        }, {
                            where: {
                                isCurrentYear: true
                            },
                            transaction: t1
                        })
                        .then(function (result) {
                            option.isCurrentYear = true;
                            return Year.create(option, {
                                transaction: t1
                            });
                        });
                })
                .then(function (year) {
                    global.currentYear = year.toJSON();
                    res.jsonp(year);
                });
        } else {
            // only save
            Year.create(option)
                .then(function (year) {
                    res.jsonp(year);
                });
        }
    });

    app.post('/admin/year/edit', checkLogin);
    app.post('/admin/year/edit', function (req, res) {
        var option = {
            name: req.body.name,
            sequence: req.body.sequence,
            isCurrentYear: false
        };

        if (req.body.iscurrent == "true") {
            // clear and update, so use transaction
            model.db.sequelize.transaction(function (t1) {
                    return Year.update({
                            isCurrentYear: false
                        }, {
                            where: {
                                isCurrentYear: true
                            },
                            transaction: t1
                        })
                        .then(function (result) {
                            option.isCurrentYear = true;
                            return Year.update(option, {
                                where: {
                                    _id: req.body.id
                                },
                                transaction: t1
                            });
                        });
                })
                .then(function (year) {
                    global.currentYear = {
                        _id: req.body.id,
                        name: req.body.name
                    };
                    res.jsonp(year);
                })
                .catch(function () {

                });
        } else {
            Year.update(option, {
                    where: {
                        _id: req.body.id
                    }
                })
                .then(function (year) {
                    res.jsonp(year);
                });
        }
    });

    app.post('/admin/year/delete', checkLogin);
    app.post('/admin/year/delete', function (req, res) {
        Year.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (year) {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/year/all', checkLogin);
    app.post('/admin/year/all', function (req, res) {
        Year.getFilters({})
            .then(function (years) {
                res.jsonp(years);
            });
    });
}