var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ClassAttribute = model.classAttribute,
    auth = require("./auth"),
    checkLogin = auth.checkLogin; // TBD

module.exports = function (app) {
    app.get('/admin/classAttributeList', checkLogin);
    app.get('/admin/classAttributeList', function (req, res) {
        res.render('Server/classAttributeList.html', {
            title: '>课程属性',
            user: req.session.admin
        });
    });

    app.post('/admin/classAttribute/add', checkLogin);
    app.post('/admin/classAttribute/add', function (req, res) {
        var classAttribute = new ClassAttribute({
            name: req.body.name,
            address: req.body.address
        });

        classAttribute.save(function (err, classAttribute) {
            if (err) {
                classAttribute = {};
            }
            res.jsonp(classAttribute);
        });
    });

    app.post('/admin/classAttribute/edit', checkLogin);
    app.post('/admin/classAttribute/edit', function (req, res) {
        var classAttribute = new ClassAttribute({
            name: req.body.name,
            address: req.body.address
        });

        classAttribute.update(req.body.id, function (err, classAttribute) {
            if (err) {
                classAttribute = {};
            }
            res.jsonp(classAttribute);
        });
    });

    app.post('/admin/classAttribute/delete', checkLogin);
    app.post('/admin/classAttribute/delete', function (req, res) {
        ClassAttribute.delete(req.body.id, function (err, classAttribute) {
            if (err) {
                res.jsonp({
                    error: err
                });
                return;
            }
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/classAttributeList/search', checkLogin);
    app.post('/admin/classAttributeList/search', function (req, res) {

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

        ClassAttribute.getAll(null, page, filter, function (err, classAttributes, total) {
            if (err) {
                classAttributes = [];
            }
            res.jsonp({
                classAttributes: classAttributes,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + classAttributes.length) == total
            });
        });
    });
}