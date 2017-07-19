var GradeSubjectCategoryRelation = require('../../models/gradeSubjectCategoryRelation.js'),
    Category = require('../../models/category.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    function newGradeSubjectCategoryRelation(categoryId, subjectId, gradeId) {
        var gradeSubjectCategoryRelation = new GradeSubjectCategoryRelation({
            subjectId: subjectId,
            gradeId: gradeId,
            categoryId: categoryId
        });

        return gradeSubjectCategoryRelation.save();
    };

    app.post('/admin/gradeSubjectCategoryRelation/save', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelation/save', function(req, res) {
        ///content
        var newCategories = JSON.parse(req.body.newCategories),
            removeCategories = JSON.parse(req.body.removeCategories),
            gradeId = req.body.gradeId,
            subjectId = req.body.subjectId,
            pArray = [];

        if (newCategories.length > 0) {
            newCategories.forEach(function(categoryId) {
                pArray.push(newGradeSubjectCategoryRelation(categoryId, subjectId, gradeId));
            });
        }

        if (removeCategories.length > 0) {
            pArray.push(GradeSubjectCategoryRelation.deleteAll({
                gradeId: gradeId,
                subjectId: subjectId,
                categoryId: { $in: removeCategories }
            }));
        }

        Promise.all(pArray).then(function() {
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/gradeSubjectCategoryRelationList/search', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelationList/search', function(req, res) {
        var result = {};

        var p0 = GradeSubjectCategoryRelation.getFilters({
            gradeId: req.body.gradeId,
            subjectId: req.body.subjectId
        }).then(function(relations) {
            result.relations = relations;
        });

        var p1 = Category.getFilters({}).then(function(categories) {
            result.categories = categories;
        });

        Promise.all([p0, p1]).then(function() {
            res.jsonp(result);
        });
    });
}