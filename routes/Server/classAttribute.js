var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ClassAttribute = model.classAttribute,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

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
        ClassAttribute.create({
                name: req.body.name,
                address: req.body.address
            })
            .then(function (classAttribute) {
                res.jsonp(classAttribute);
            });
    });

    app.post('/admin/classAttribute/edit', checkLogin);
    app.post('/admin/classAttribute/edit', function (req, res) {
        ClassAttribute.update({
                name: req.body.name,
                address: req.body.address
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (classAttribute) {
                res.jsonp(classAttribute);
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.post('/admin/classAttribute/delete', checkLogin);
    app.post('/admin/classAttribute/delete', function (req, res) {
        ClassAttribute.update({
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
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.post('/admin/classAttributeList/search', checkLogin);
    app.post('/admin/classAttributeList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        ClassAttribute.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                classAttributes: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });
}