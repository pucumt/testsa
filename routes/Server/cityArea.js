var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    CityArea = model.cityArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/cityArea', checkLogin);
    app.get('/admin/cityArea', function (req, res) {
        res.render('Server/cityAreaList.html', {
            title: '>行政区设置',
            user: req.session.admin
        });
    });


    app.post('/admin/cityArea/add', checkLogin);
    app.post('/admin/cityArea/add', function (req, res) {
        CityArea.create({
                name: req.body.name,
                sequence: req.body.sequence,
                createdBy: req.session.admin._id
            })
            .then(function (cityArea) {
                res.jsonp(cityArea);
            });
    });

    app.post('/admin/cityArea/edit', checkLogin);
    app.post('/admin/cityArea/edit', function (req, res) {
        CityArea.update({
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

    app.post('/admin/cityArea/delete', checkLogin);
    app.post('/admin/cityArea/delete', function (req, res) {
        CityArea.update({
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

    app.post('/admin/cityArea/search', checkLogin);
    app.post('/admin/cityArea/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        CityArea.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    cityAreas: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
    });

    app.get('/admin/cityArea/all', checkLogin);
    app.get('/admin/cityArea/all', function (req, res) {
        CityArea.getFilters({})
            .then(function (cityAreas) {
                res.jsonp(cityAreas);
            });
    });
}