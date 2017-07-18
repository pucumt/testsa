var GradeSubjectCategoryRelation = require('../../models/gradeSubjectCategoryRelation.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/gradeSubjectCategoryRelationList', checkLogin);
    app.get('/admin/gradeSubjectCategoryRelationList', function(req, res) {
        res.render('Server/gradeSubjectCategoryRelationList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/gradeSubjectCategoryRelation/add', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelation/add', function(req, res) {
        var gradeSubjectCategoryRelation = new GradeSubjectCategoryRelation({
            name: req.body.name,
            address: req.body.address
        });

        gradeSubjectCategoryRelation.save(function(err, gradeSubjectCategoryRelation) {
            if (err) {
                gradeSubjectCategoryRelation = {};
            }
            res.jsonp(gradeSubjectCategoryRelation);
        });
    });

    app.post('/admin/gradeSubjectCategoryRelation/edit', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelation/edit', function(req, res) {
        var gradeSubjectCategoryRelation = new GradeSubjectCategoryRelation({
            name: req.body.name,
            address: req.body.address
        });

        gradeSubjectCategoryRelation.update(req.body.id, function(err, gradeSubjectCategoryRelation) {
            if (err) {
                gradeSubjectCategoryRelation = {};
            }
            res.jsonp(gradeSubjectCategoryRelation);
        });
    });

    app.post('/admin/gradeSubjectCategoryRelation/delete', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelation/delete', function(req, res) {
        GradeSubjectCategoryRelation.delete(req.body.id, function(err, gradeSubjectCategoryRelation) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/gradeSubjectCategoryRelationList/search', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelationList/search', function(req, res) {

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

        GradeSubjectCategoryRelation.getAll(null, page, filter, function(err, gradeSubjectCategoryRelations, total) {
            if (err) {
                gradeSubjectCategoryRelations = [];
            }
            res.jsonp({
                gradeSubjectCategoryRelations: gradeSubjectCategoryRelations,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + gradeSubjectCategoryRelations.length) == total
            });
        });
    });
}