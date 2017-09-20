var model = require("../../model.js"),
    SchoolArea = model.schoolArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/schoolAreaList', checkLogin);
    app.get('/admin/schoolAreaList', auth.checkSecure);
    app.get('/admin/schoolAreaList', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        SchoolArea.getFiltersWithPage(page, {}).then(function (result) {
            res.render('Server/schoolAreaList.html', {
                title: '>校区设置',
                user: req.session.admin,
                schoolAreas: result.rows,
                total: result.count
            });
        });
    });

    app.post('/admin/schoolArea/add', checkLogin);
    app.post('/admin/schoolArea/add', function (req, res) {
        SchoolArea.create({
            name: req.body.name,
            address: req.body.address,
            sequence: req.body.sequence
        }).then(function (schoolArea) {
            res.jsonp(schoolArea);
        });
    });

    app.post('/admin/schoolArea/edit', checkLogin);
    app.post('/admin/schoolArea/edit', function (req, res) {
        SchoolArea.update({
            name: req.body.name,
            address: req.body.address,
            sequence: req.body.sequence
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (schoolArea) {
            res.jsonp(schoolArea);
        });
    });

    app.post('/admin/schoolArea/delete', checkLogin);
    app.post('/admin/schoolArea/delete', function (req, res) {
        SchoolArea.update({
            isDeleted: true
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (schoolArea) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.get('/admin/schoolArea/all', checkLogin);
    app.get('/admin/schoolArea/all', function (req, res) {
        SchoolArea.getFilters({}).then(function (schoolAreas) {
            res.jsonp(grades);
        });
    });

    app.get('/admin/schoolArea/settings/:id', checkLogin);
    app.get('/admin/schoolArea/settings/:id', function (req, res) {
        SchoolArea.getFilter({
            _id: req.params.id
        }).then(function (school) {
            if (school) {
                res.render('Server/schoolGradeRelationList.html', {
                    title: '>' + school.name + '>校区年级',
                    user: req.session.admin,
                    schoolId: req.params.id
                });
            }
        });
    });
}