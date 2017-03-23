var AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    ExamClass = require('../../models/examClass.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/adminEnrollExamList', checkLogin);
    app.get('/admin/adminEnrollExamList', function(req, res) {
        res.render('Server/adminEnrollExamList.html', {
            title: '>测试报名',
            user: req.session.user
        });
    });

    app.get('/admin/examOrderList', checkLogin);
    app.get('/admin/examOrderList', function(req, res) {
        res.render('Server/examOrderList.html', {
            title: '>测试订单',
            user: req.session.user
        });
    });

    app.post('/admin/adminEnrollExam/search', checkLogin);
    app.post('/admin/adminEnrollExam/search', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentName) {
            var reg = new RegExp(req.body.studentName, 'i')
            filter.studentName = {
                $regex: reg
            };
        }
        if (req.body.className) {
            var reg = new RegExp(req.body.className, 'i')
            filter.examName = {
                $regex: reg
            };
        }
        if (req.body.isSucceed) {
            filter.isSucceed = req.body.isSucceed;
        }
        AdminEnrollExam.getAll(null, page, filter, function(err, adminEnrollExams, total) {
            if (err) {
                adminEnrollExams = [];
            }
            res.jsonp({
                adminEnrollExams: adminEnrollExams,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + adminEnrollExams.length) == total
            });
        });
    });

    app.post('/admin/adminEnrollExam/add', checkLogin);
    app.post('/admin/adminEnrollExam/add', function(req, res) {
        var adminEnrollExam = new AdminEnrollExam({
            studentId: req.body.studentId,
            studentName: req.body.studentName,
            mobile: req.body.mobile,
            examId: req.body.examId,
            examName: req.body.examName,
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName,
            isSucceed: 1
        });

        return adminEnrollExam.save();
    });

    app.post('/admin/adminEnrollExam/edit', checkLogin);
    app.post('/admin/adminEnrollExam/edit', function(req, res) {
        var adminEnrollExam = new AdminEnrollExam({
            studentId: req.body.studentId,
            studentName: req.body.studentName,
            mobile: req.body.mobile,
            examId: req.body.examId,
            examName: req.body.examName,
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName
        });

        adminEnrollExam.update(req.body.id, function(err, adminEnrollExam) {
            if (err) {
                adminEnrollExam = {};
            }
            res.jsonp(adminEnrollExam);
        });
    });

    app.post('/admin/adminEnrollExam/delete', checkLogin);
    app.post('/admin/adminEnrollExam/delete', function(req, res) {
        AdminEnrollExam.delete(req.body.id, function(err, adminEnrollExam) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/adminEnrollExam/enroll', checkLogin);
    app.post('/admin/adminEnrollExam/enroll', function(req, res) {
        AdminEnrollExam.getByStudentAndCategory(req.body.studentId, req.body.examCategoryId)
            .then(function(enrollExam) {
                if (enrollExam) {
                    res.jsonp({ error: "你已经报过名了，此课程不允许多次报名" });
                    return;
                }

                ExamClass.enroll(req.body.examId)
                    .then(function(examClass) {
                        if (examClass && examClass.ok && examClass.nModified == 1) {
                            //报名成功
                            var adminEnrollExam = new AdminEnrollExam({
                                studentId: req.body.studentId,
                                studentName: req.body.studentName,
                                mobile: req.body.mobile,
                                examId: req.body.examId,
                                examName: req.body.examName,
                                examCategoryId: req.body.examCategoryId,
                                examCategoryName: req.body.examCategoryName,
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

    app.post('/admin/adminEnrollExam/cancel', checkLogin);
    app.post('/admin/adminEnrollExam/cancel', function(req, res) {
        ExamClass.cancel(req.body.examId)
            .then(function(examClass) {
                if (examClass && examClass.ok && examClass.nModified == 1) {
                    AdminEnrollExam.cancel(req.body.id, function(err, adminEnrollExam) {
                        if (err) {
                            res.jsonp({ error: err });
                            return;
                        }
                        res.jsonp({ sucess: true });
                    });
                } else {
                    res.jsonp({ error: "取消失败" });
                    return;
                }
            });
    });
}