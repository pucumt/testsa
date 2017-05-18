var Year = require('../../models/year.js'),
    xlsx = require("node-xlsx"),
    auth = require("./auth"),
    path = require('path'),
    checkLogin = auth.checkLogin,
    serverPath = __dirname;

module.exports = function(app) {
    function checkcurrentYear() {
        Year.getFilter({ isCurrentYear: true })
            .then(function(year) {
                if (year) {
                    global.currentYear = year.toJSON();
                }
            });
    };
    checkcurrentYear();

    app.get('/admin/yearList', checkLogin);
    app.get('/admin/yearList', function(req, res) {
        //var list = xlsx.parse(path.join(serverPath, "../../../1.xlsx"));
        //list[0].data[0] [0] [1] [2]

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Year.getAll(null, page, {}, function(err, years, total) {
            if (err) {
                years = [];
            }
            res.render('Server/yearList.html', {
                title: '>年度设置',
                user: req.session.admin,
                years: years,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + years.length) == total
            });
        });
    });

    app.post('/admin/year/add', checkLogin);
    app.post('/admin/year/add', function(req, res) {
        var year = new Year({
            name: req.body.name,
            isCurrentYear: req.body.iscurrent || false
        });
        var p = Promise.resolve();
        if (req.body.iscurrent) {
            p = Year.clearCurrentYear();
        }
        p.then(function() {
            year.save(function(err, year) {
                if (err) {
                    year = {};
                }
                if (req.body.iscurrent) {
                    global.currentYear = year.toJSON();
                }
                res.jsonp(year);
            });
        });
    });

    app.post('/admin/year/edit', checkLogin);
    app.post('/admin/year/edit', function(req, res) {
        var year = new Year({
            name: req.body.name,
            isCurrentYear: req.body.iscurrent || false
        });

        var p = Promise.resolve();
        if (req.body.iscurrent) {
            p = Year.clearCurrentYear();
        }
        p.then(function() {
            year.update(req.body.id, function(err, year) {
                if (err) {
                    year = {};
                }
                if (req.body.iscurrent) {
                    global.currentYear = {
                        _id: req.body.id,
                        name: req.body.name
                    };
                }
                res.jsonp(year);
            });
        });
    });

    app.post('/admin/year/delete', checkLogin);
    app.post('/admin/year/delete', function(req, res) {
        Year.delete(req.body.id, function(err, year) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/year/all', checkLogin);
    app.post('/admin/year/all', function(req, res) {
        Year.getFilters({})
            .then(function(years) {
                res.jsonp(years);
            });
    });
}