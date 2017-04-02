var Year = require('../../models/year.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/yearList', checkLogin);
    app.get('/admin/yearList', function(req, res) {
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
            name: req.body.name
        });

        year.save(function(err, year) {
            if (err) {
                year = {};
            }
            res.jsonp(year);
        });
    });

    app.post('/admin/year/edit', checkLogin);
    app.post('/admin/year/edit', function(req, res) {
        var year = new Year({
            name: req.body.name
        });

        year.update(req.body.id, function(err, year) {
            if (err) {
                year = {};
            }
            res.jsonp(year);
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
}