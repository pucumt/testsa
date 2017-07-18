var GradeSubjectRelation = require('../../models/gradeSubjectRelation.js'),
    Subject = require('../../models/subject.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    function newGradeSubjectRelation(subjectId, gradeId) {
        var gradeSubjectRelation = new GradeSubjectRelation({
            subjectId: subjectId,
            gradeId: gradeId
        });

        return gradeSubjectRelation.save();
    };

    app.post('/admin/gradeSubjectRelation/save', checkLogin);
    app.post('/admin/gradeSubjectRelation/save', function(req, res) {
        ///content
        var newSubjects = JSON.parse(req.body.newSubjects),
            removeSubjects = JSON.parse(req.body.removeSubjects),
            gradeId = req.body.gradeId,
            pArray = [];

        if (newSubjects.length > 0) {
            newSubjects.forEach(function(subjectId) {
                pArray.push(newGradeSubjectRelation(subjectId, gradeId));
            });
        }

        if (removeSubjects.length > 0) {
            pArray.push(GradeSubjectRelation.deleteAll({
                gradeId: gradeId,
                gradeId: { $in: removeSubjects }
            }));
        }

        Promise.all(pArray).then(function() {
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/gradeSubjectRelationList/search', checkLogin);
    app.post('/admin/gradeSubjectRelationList/search', function(req, res) {
        var result = {};

        var p0 = GradeSubjectRelation.getFilters({
            gradeId: req.body.gradeId
        }).then(function(relations) {
            result.relations = relations;
        });

        var p1 = Subject.getFilters({}).then(function(subjects) {
            result.subjects = subjects;
        });

        Promise.all([p0, p1]).then(function() {
            res.jsonp(result);
        });
    });
}