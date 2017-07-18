var SchoolGradeRelation = require('../../models/schoolGradeRelation.js'),
    Grade = require('../../models/grade.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    function newSchoolGradeRelation(gradeId, schoolId) {
        var schoolGradeRelation = new SchoolGradeRelation({
            schoolId: schoolId,
            gradeId: gradeId
        });

        return schoolGradeRelation.save();
    };

    app.post('/admin/schoolGradeRelation/save', checkLogin);
    app.post('/admin/schoolGradeRelation/save', function(req, res) {
        var newGrades = JSON.parse(req.body.newGrades),
            removeGrades = JSON.parse(req.body.removeGrades),
            schoolId = req.body.schoolId,
            pArray = [];

        if (newGrades.length > 0) {
            newGrades.forEach(function(gradeId) {
                pArray.push(newSchoolGradeRelation(gradeId, schoolId));
            });
        }

        if (removeGrades.length > 0) {
            pArray.push(SchoolGradeRelation.deleteAll({
                schoolId: schoolId,
                gradeId: { $in: removeGrades }
            }));
        }

        Promise.all(pArray).then(function() {
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/schoolGradeRelationList/search', checkLogin);
    app.post('/admin/schoolGradeRelationList/search', function(req, res) {
        var result = {};

        var p0 = SchoolGradeRelation.getFilters({
            schoolId: req.body.schoolId
        }).then(function(relations) {
            result.relations = relations;
        });

        var p1 = Grade.getFilters({}).then(function(grades) {
            result.grades = grades;
        });

        Promise.all([p0, p1]).then(function() {
            res.jsonp(result);
        });
    });
}