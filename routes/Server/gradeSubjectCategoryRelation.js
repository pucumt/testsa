var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    GradeSubjectCategoryRelation = model.gradeSubjectCategoryRelation,
    Category = model.category,
    TrainClass = model.trainClass,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    function newGradeSubjectCategoryRelation(categoryId, subjectId, gradeId) {
        return GradeSubjectCategoryRelation.create({
            subjectId: subjectId,
            gradeId: gradeId,
            categoryId: categoryId
        });
    };

    app.post('/admin/gradeSubjectCategoryRelation/save', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelation/save', function (req, res) {
        ///content
        var newCategories = JSON.parse(req.body.newCategories),
            removeCategories = JSON.parse(req.body.removeCategories),
            gradeId = req.body.gradeId,
            subjectId = req.body.subjectId,
            pArray = [];

        if (newCategories.length > 0) {
            newCategories.forEach(function (categoryId) {
                pArray.push(newGradeSubjectCategoryRelation(categoryId, subjectId, gradeId));
            });
        }

        if (removeCategories.length > 0) {
            pArray.push(GradeSubjectCategoryRelation.update({
                isDeleted: true
            }, {
                where: {
                    gradeId: gradeId,
                    subjectId: subjectId,
                    categoryId: {
                        $in: removeCategories
                    }
                }
            }));
        }

        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/gradeSubjectCategoryRelationList/search', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelationList/search', function (req, res) {
        var result = {};

        var p0 = GradeSubjectCategoryRelation.getFilters({
            gradeId: req.body.gradeId,
            subjectId: req.body.subjectId
        }).then(function (relations) {
            result.relations = relations;
        });

        var p1 = Category.getFilters({}).then(function (categories) {
            result.categories = categories;
        });

        Promise.all([p0, p1]).then(function () {
            res.jsonp(result);
        });
    });

    app.post('/admin/gradeSubjectCategoryRelation/filter', checkLogin);
    app.post('/admin/gradeSubjectCategoryRelation/filter', function (req, res) {
        model.db.sequelize.query("select C.* from gradeSubjectCategoryRelations R, categorys C,\
         (select gradeId, subjectId from trainClasss where _id=:trainId) T where \
         R.categoryId=C._id and R.gradeId=T.gradeId and R.subjectId=T.subjectId and R.isDeleted=false and C.isDeleted=false", {
                replacements: {
                    trainId: req.body.trainId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(relations => {
                res.jsonp(relations);
            });
    });
}