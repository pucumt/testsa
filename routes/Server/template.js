var SchoolArea = require('../../models/schoolArea.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/schoolAreaList', checkLogin);
    app.get('/admin/schoolAreaList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        SchoolArea.getAll(null, page, {}, function(err, schoolAreas, total) {
            if (err) {
                schoolAreas = [];
            }
            res.render('Server/schoolAreaList.html', {
                title: '校区列表',
                user: req.session.user,
                schoolAreas: schoolAreas
            });
        });
    });

    app.post('/admin/schoolArea/add', checkLogin);
    app.post('/admin/schoolArea/add', function(req, res) {
        var schoolArea = new SchoolArea({
            name: req.body.name,
            address: req.body.address
        });

        schoolArea.save(function(err, schoolArea) {
            if (err) {
                user = {};
            }
            res.jsonp(schoolArea);
        });
    });

    app.post('/admin/schoolArea/edit', checkLogin);
    app.post('/admin/schoolArea/edit', function(req, res) {
        var schoolArea = new SchoolArea({
            name: req.body.name,
            address: req.body.address
        });

        schoolArea.update(req.body.id, function(err, schoolArea) {
            if (err) {
                schoolArea = {};
            }
            res.jsonp(schoolArea);
        });
    });

    app.post('/admin/schoolArea/delete', checkLogin);
    app.post('/admin/schoolArea/delete', function(req, res) {
        SchoolArea.delete(req.body.id, function(err, schoolArea) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
}