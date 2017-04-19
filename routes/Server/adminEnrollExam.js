var AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    ExamClass = require('../../models/examClass.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    StudentAccount = require('../../models/studentAccount.js'),
    ClassRoom = require('../../models/classRoom.js'),
    ExamClassExamArea = require('../../models/examClassExamArea.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/adminEnrollExamList', checkLogin);
    app.get('/admin/adminEnrollExamList', function(req, res) {
        res.render('Server/adminEnrollExamList.html', {
            title: '>测试报名',
            user: req.session.admin
        });
    });

    app.get('/admin/examOrderList', checkLogin);
    app.get('/admin/examOrderList', function(req, res) {
        res.render('Server/examOrderList.html', {
            title: '>测试订单',
            user: req.session.admin
        });
    });

    app.get('/admin/cardSearch', checkLogin);
    app.get('/admin/cardSearch', function(req, res) {
        res.render('Server/cardSearch.html', {
            title: '>准考证查询',
            user: req.session.admin
        });
    });

    app.get('/admin/ScoreInput', checkLogin);
    app.get('/admin/ScoreInput', function(req, res) {
        res.render('Server/ScoreInput.html', {
            title: '>成绩录入',
            user: req.session.admin
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
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
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

    app.post('/admin/adminEnrollExam/searchCard', checkLogin);
    app.post('/admin/adminEnrollExam/searchCard', function(req, res) {
        var filter = {},
            pAccount = Promise.resolve();
        if (req.body.mobile) {
            pAccount = StudentAccount.getFilter({ name: req.body.mobile });
        }
        pAccount.then(function(account) {
            if (account) {
                filter.accountId = account._id;
            }
            if (req.body.studentName) {
                filter.name = req.body.studentName;
            }
            if (isEmptyObject(filter)) {
                res.jsonp({
                    adminEnrollExams: []
                });
            } else {
                return StudentInfo.getFilters(filter).then(function(students) {
                    if (students.length > 0) {
                        var ids = students.map(function(student) {
                            return student._id;
                        });
                        return AdminEnrollExam.getAllWithoutPaging({ studentId: { $in: ids }, isSucceed: 1 })
                            .then(function(adminEnrollExams) {
                                res.jsonp({
                                    adminEnrollExams: adminEnrollExams
                                });
                            });
                    }
                    res.jsonp({
                        adminEnrollExams: []
                    });
                });
            }
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
        ExamClass.get(req.body.examId)
            .then(function(examClass) {
                if (examClass) {
                    AdminEnrollExam.getByStudentAndCategory(req.body.studentId, req.body.examCategoryId, req.body.examId)
                        .then(function(enrollExam) {
                            if (enrollExam) {
                                res.jsonp({ error: "你已经报过名了，此课程不允许多次报名" });
                                return;
                            }
                            ExamClass.enroll(req.body.examId)
                                .then(function(result) {
                                    if (result && result.ok && result.nModified == 1) {
                                        //报名成功
                                        var adminEnrollExam = new AdminEnrollExam({
                                            studentId: req.body.studentId,
                                            studentName: req.body.studentName,
                                            mobile: req.body.mobile,
                                            examId: req.body.examId,
                                            examName: req.body.examName,
                                            examCategoryId: req.body.examCategoryId,
                                            examCategoryName: req.body.examCategoryName,
                                            isSucceed: 1,
                                            scores: examClass.subjects
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
                }
            });
    });

    //examClassExamAreaId: examArea
    app.post('/admin/adminEnrollExam/enroll2', checkLogin);
    app.post('/admin/adminEnrollExam/enroll2', function(req, res) {
        ExamClass.get(req.body.examId)
            .then(function(examClass) {
                if (examClass) {
                    AdminEnrollExam.getByStudentAndCategory(req.body.studentId, req.body.examCategoryId, req.body.examId)
                        .then(function(enrollExam) {
                            if (enrollExam) {
                                res.jsonp({ error: "你已经报过名了，此课程不允许多次报名" });
                                return;
                            }
                            ExamClassExamArea.enroll(req.body.examClassExamAreaId)
                                .then(function(result) {
                                    if (result && result.ok && result.nModified == 1) {
                                        //报名成功
                                        //更新总数，更新订单
                                        ExamClass.enroll2(req.body.examId);

                                        ExamClassExamArea.get(req.body.examClassExamAreaId)
                                            .then(function(examClassExamArea) {
                                                var adminEnrollExam = new AdminEnrollExam({
                                                    studentId: req.body.studentId,
                                                    studentName: req.body.studentName,
                                                    mobile: req.body.mobile,
                                                    examId: req.body.examId,
                                                    examName: req.body.examName,
                                                    examCategoryId: req.body.examCategoryId,
                                                    examCategoryName: req.body.examCategoryName,
                                                    isSucceed: 1,
                                                    scores: examClass.subjects,
                                                    examAreaId: examClassExamArea.examAreaId,
                                                    examAreaName: examClassExamArea.examAreaName
                                                });
                                                adminEnrollExam.save()
                                                    .then(function(enrollExam) {
                                                        res.jsonp({ sucess: true });
                                                        return;
                                                    });
                                            });
                                    } else {
                                        //报名失败
                                        res.jsonp({ error: "报名失败" });
                                        return;
                                    }
                                });
                        });
                }
            });
    });

    app.post('/admin/adminEnrollExam/cancel', checkLogin);
    app.post('/admin/adminEnrollExam/cancel', function(req, res) {
        if (req.body.examAreaId) {
            //mult exam areas
            ExamClassExamArea.getFilter({ examId: req.body.examId, examAreaId: req.body.examAreaId })
                .then(function(examClassExamArea) {
                    if (examClassExamArea) { //mult exam areas
                        ExamClassExamArea.cancel(examClassExamArea._id)
                            .then(function(examClassExamAreaResult) {
                                if (examClassExamAreaResult && examClassExamAreaResult.ok && examClassExamAreaResult.nModified == 1) {
                                    ExamClass.cancel2(req.body.examId).then(function(examClass) {
                                        if (examClass && examClass.ok && examClass.nModified == 1) {
                                            AdminEnrollExam.cancel(req.body.id, function(err, adminEnrollExam) {
                                                if (err) {
                                                    res.jsonp({ error: err });
                                                    return;
                                                }
                                                res.jsonp({ sucess: true });
                                            });
                                        } else {
                                            res.jsonp({ error: "取消总数失败" });
                                            return;
                                        }
                                    });
                                } else {
                                    res.jsonp({ error: "取消失败" });
                                    return;
                                }
                            });
                    }
                });
        } else {
            //only one exam areas
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

        }
    });

    app.post('/admin/adminEnrollExam/searchExam', checkLogin);
    app.post('/admin/adminEnrollExam/searchExam', function(req, res) {
        //need change later
        var returnResult = {};
        AdminEnrollExam.get(req.body.id)
            .then(function(examOrder) {
                if (examOrder) {
                    returnResult.examName = examOrder.examName;
                    returnResult.classRoomId = examOrder.classRoomId;
                    returnResult.classRoomName = examOrder.classRoomName;
                    returnResult.examNo = examOrder.examNo;
                    returnResult.score = examOrder.score;
                    return ExamClass.get(examOrder.examId);
                }
            })
            .then(function(examClass) {
                if (examClass) {
                    returnResult.examDate = examClass.examDate;
                    returnResult.examTime = examClass.examTime;
                    return ClassRoom.get(returnResult.classRoomId);
                }
            }).then(function(classRoom) {
                if (classRoom) {
                    returnResult.schoolArea = classRoom.schoolArea;
                }
                return res.jsonp(returnResult);
            });
    });

    app.post('/admin/adminEnrollExam/ScoreInput', checkLogin);
    app.post('/admin/adminEnrollExam/ScoreInput', function(req, res) {
        var adminEnrollExam = new AdminEnrollExam({
            score: req.body.score,
        });

        adminEnrollExam.update(req.body.id, function(err, adminEnrollExam) {
            if (err) {
                adminEnrollExam = {};
            }
            res.jsonp(adminEnrollExam);
        });
    });

    function isEmptyObject(e) {
        var t;
        for (t in e) {
            return false;
        }
        return true;
    };
}