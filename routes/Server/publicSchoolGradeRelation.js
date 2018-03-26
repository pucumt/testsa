var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    PublicSchoolGradeRelation = model.publicSchoolGradeRelation,
    PublicGrade = model.publicGrade,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    function newPublicSchoolGradeRelation(publicGradeId, publicSchoolId) {
        return PublicSchoolGradeRelation.create({
            publicSchoolId: publicSchoolId,
            publicGradeId: publicGradeId
        });
    };

    app.post('/admin/publicSchoolGradeRelation/save', checkLogin);
    app.post('/admin/publicSchoolGradeRelation/save', function (req, res) {
        var newGrades = JSON.parse(req.body.newGrades),
            removeGrades = JSON.parse(req.body.removeGrades),
            publicSchoolId = req.body.publicSchoolId,
            pArray = [];

        if (newGrades.length > 0) {
            newGrades.forEach(function (gradeId) {
                pArray.push(newPublicSchoolGradeRelation(gradeId, publicSchoolId));
            });
        }

        if (removeGrades.length > 0) {
            pArray.push(PublicSchoolGradeRelation.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    publicSchoolId: publicSchoolId,
                    publicGradeId: {
                        $in: removeGrades
                    }
                }
            }));
        }

        Promise.all(pArray)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/publicSchoolGradeRelationList/search', checkLogin);
    app.post('/admin/publicSchoolGradeRelationList/search', function (req, res) {
        var result = {};

        var p0 = PublicSchoolGradeRelation.getFilters({
                publicSchoolId: req.body.publicSchoolId
            })
            .then(function (relations) {
                result.relations = relations;
            });

        var p1 = PublicGrade.getFilters({})
            .then(function (publicGrades) {
                result.publicGrades = publicGrades;
            });

        Promise.all([p0, p1])
            .then(function () {
                res.jsonp(result);
            });
    });
}