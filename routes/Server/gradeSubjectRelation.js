var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    GradeSubjectRelation = model.gradeSubjectRelation,
    Subject = model.subject,
    Grade = model.grade,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    function newGradeSubjectRelation(subjectId, gradeId) {
        return GradeSubjectRelation.create({
            subjectId: subjectId,
            gradeId: gradeId
        });
    };

    app.post('/admin/gradeSubjectRelation/save', checkLogin);
    app.post('/admin/gradeSubjectRelation/save', function (req, res) {
        ///content
        var newSubjects = JSON.parse(req.body.newSubjects),
            removeSubjects = JSON.parse(req.body.removeSubjects),
            gradeId = req.body.gradeId,
            pArray = [];

        if (newSubjects.length > 0) {
            newSubjects.forEach(function (subjectId) {
                pArray.push(newGradeSubjectRelation(subjectId, gradeId));
            });
        }

        if (removeSubjects.length > 0) {
            pArray.push(GradeSubjectRelation.update({
                isDeleted: true
            }, {
                where: {
                    gradeId: gradeId,
                    subjectId: {
                        $in: removeSubjects
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

    app.post('/admin/gradeSubjectRelationList/search', checkLogin);
    app.post('/admin/gradeSubjectRelationList/search', function (req, res) {
        var result = {};

        var p0 = GradeSubjectRelation.getFilters({
            gradeId: req.body.gradeId
        }).then(function (relations) {
            result.relations = relations;
        });

        var p1 = Subject.getFilters({}).then(function (subjects) {
            result.subjects = subjects;
        });

        Promise.all([p0, p1]).then(function () {
            res.jsonp(result);
        });
    });

    app.get('/admin/gradeSubject/settings/:gradeId/:subjectId', checkLogin);
    app.get('/admin/gradeSubject/settings/:gradeId/:subjectId', function (req, res) {
        Grade.getFilter({
            _id: req.params.gradeId
        }).then(function (grade) {
            if (grade) {
                Subject.getFilter({
                    _id: req.params.subjectId
                }).then(function (subject) {
                    res.render('Server/gradeSubjectCategoryRelationList.html', {
                        title: '>' + grade.name + '>' + subject.name + '>年级科目难度',
                        user: req.session.admin,
                        gradeId: req.params.gradeId,
                        subjectId: req.params.subjectId
                    });
                });
            }
        });
    });
}