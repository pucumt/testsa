var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ExamArea = model.examArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/examAreaList', checkLogin);
    app.get('/admin/examAreaList', function (req, res) {
        res.render('Server/examAreaList.html', {
            title: '>考区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/examArea/add', checkLogin);
    app.post('/admin/examArea/add', function (req, res) {
        ExamArea.create({
            name: req.body.name,
            address: req.body.address
        }).then(function (examArea) {
            res.jsonp(examArea);
        });
    });

    app.post('/admin/examArea/edit', checkLogin);
    app.post('/admin/examArea/edit', function (req, res) {
        ExamArea.update({
            name: req.body.name,
            address: req.body.address
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (examArea) {
            res.jsonp(examArea);
        });
    });

    app.post('/admin/examArea/delete', checkLogin);
    app.post('/admin/examArea/delete', function (req, res) {
        ExamArea.update({
            isDeleted: true,
            deletedBy: req.session.admin._id,
            deletedDate: new Date()
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

    app.post('/admin/examAreaList/search', checkLogin);
    app.post('/admin/examAreaList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        ExamArea.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                examAreas: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.get('/admin/examAreaList/getAllWithoutPage', checkLogin);
    app.get('/admin/examAreaList/getAllWithoutPage', function (req, res) {
        ExamArea.getFilters({})
            .then(function (examAreas) {
                res.jsonp(examAreas);
            });
    });
}