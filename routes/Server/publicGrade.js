var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    PublicGrade = model.publicGrade,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/publicGrade', checkLogin);
    app.get('/admin/publicGrade', function (req, res) {
        res.render('Server/publicGradeList.html', {
            title: '>公立学校类别',
            user: req.session.admin
        });
    });

    app.post('/admin/publicGrade/add', checkLogin);
    app.post('/admin/publicGrade/add', function (req, res) {
        PublicGrade.create({
                name: req.body.name,
                sequence: req.body.sequence,
                createdBy: req.session.admin._id
            })
            .then(function (publicGrade) {
                res.jsonp(publicGrade);
            });
    });

    app.post('/admin/publicGrade/edit', checkLogin);
    app.post('/admin/publicGrade/edit', function (req, res) {
        PublicGrade.update({
                name: req.body.name,
                sequence: req.body.sequence,
                deletedBy: req.session.admin._id,
                updatedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (teacher) {
                res.jsonp(teacher);
            });
    });

    app.post('/admin/publicGrade/delete', checkLogin);
    app.post('/admin/publicGrade/delete', function (req, res) {
        PublicGrade.update({
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

    app.post('/admin/publicGrade/search', checkLogin);
    app.post('/admin/publicGrade/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        PublicGrade.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    publicGrades: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
    });
}