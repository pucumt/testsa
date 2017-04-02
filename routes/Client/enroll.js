var ExamClass = require('../../models/examClass.js'),
    AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function(app) {
    app.get('/enrollExam', function(req, res) {
        res.render('Client/enroll_exam.html', {
            title: '考试报名',
            user: req.session.user
        });
    });

    app.get('/enrollClass', function(req, res) {
        res.render('Client/enroll_class.html', {
            title: '课程报名',
            user: req.session.user
        });
    });

    app.get('/enroll/exam', function(req, res) {
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 14 篇文章
        ExamClass.getAll(null, page, { isWeixin: 1 }, function(err, examClasss, total) {
            if (err) {
                examClasss = [];
            }
            res.jsonp({
                examClasss: examClasss,
                isLastPage: ((page - 1) * 14 + examClasss.length) == total
            });
        });
    });

    app.get('/enroll/exam/:id', function(req, res) {
        ExamClass.get(req.params.id)
            .then(function(exam) {
                res.render('Client/enroll_exam_detail.html', {
                    title: '考试报名',
                    exam: exam
                });
            });
    });

    app.post('/enroll/exam/enroll', checkLogin);
    app.post('/enroll/exam/enroll', function(req, res) {
        ExamClass.get(req.body.examId)
            .then(function(examClass) {
                if (examClass) {
                    //studentId
                    AdminEnrollExam.getByStudentAndCategory(req.body.studentId, examClass.examCategoryId)
                        .then(function(enrollExam) {
                            if (enrollExam) {
                                res.jsonp({ error: "你已经报过名了，此测试不允许多次报名" });
                                return;
                            }
                            StudentInfo.get(req.body.studentId)
                                .then(function(student) {
                                    ExamClass.enroll(req.body.examId)
                                        .then(function(result) {
                                            if (result && result.ok && result.nModified == 1) {
                                                //报名成功
                                                var adminEnrollExam = new AdminEnrollExam({
                                                    studentId: student._id,
                                                    studentName: student.name,
                                                    mobile: student.mobile,
                                                    examId: examClass._id,
                                                    examName: examClass.name,
                                                    examCategoryId: examClass.examCategoryId,
                                                    examCategoryName: examClass.examCategoryName,
                                                    isSucceed: 1
                                                });
                                                adminEnrollExam.save()
                                                    .then(function(enrollExam) {
                                                        res.jsonp({ sucess: true });
                                                        return;
                                                    });
                                            } else {
                                                //报名失败
                                                res.jsonp({ error: "报名失败" });
                                                return;
                                            }
                                        });
                                });
                        });
                }
            });
    });

    app.get('/enroll/students', checkJSONLogin);
    app.get('/enroll/students', function(req, res) {
        var filter = { accountId: req.session.user._id };
        StudentInfo.getFilters(filter)
            .then(function(students) {
                res.jsonp({ students: students });
                return;
            });
    });
};