var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ExamClassExamArea = model.examClassExamArea,
    ExamArea = model.examArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/examClassExamArea/withAllexamArea', checkLogin);
    app.post('/admin/examClassExamArea/withAllexamArea', function (req, res) {
        ExamArea.getFilters({})
            .then(function (examAreas) {
                ExamClassExamArea.getFilters({
                    examId: req.body.examId
                }).then(function (examClassExamAreas) {
                    res.jsonp({
                        examAreas: examAreas,
                        examClassExamAreas: examClassExamAreas
                    });
                });
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.post('/admin/examClassExamArea/examAreas', checkLogin);
    app.post('/admin/examClassExamArea/examAreas', function (req, res) {
        ExamClassExamArea.getFilters({
                examId: req.body.examId
            })
            .then(function (examClassExamAreas) {
                res.jsonp(examClassExamAreas);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });
}