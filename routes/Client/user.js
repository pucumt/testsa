var StudentInfo = require('../../models/studentInfo.js'),
    CouponAssign = require('../../models/couponAssign.js'),
    TrainClass = require('../../models/trainClass.js'),
    ExamClass = require('../../models/examClass.js'),
    AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    ClassRoom = require('../../models/classRoom.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function(app) {
    app.post('/studentInfo/add', checkJSONLogin);
    app.post('/studentInfo/add', function(req, res) {
        StudentInfo.getFilter({ accountId: req.session.user._id, name: req.body.name })
            .then(function(student) {
                if (student) {
                    res.jsonp({ error: "此学生已经存在" });
                } else {
                    var studentInfo = new StudentInfo({
                        name: req.body.name,
                        mobile: req.body.mobile,
                        sex: req.body.sex,
                        School: req.body.School,
                        className: req.body.className,
                        gradeId: req.body.gradeId,
                        gradeName: req.body.gradeName,
                        accountId: req.session.user._id
                    });

                    studentInfo.save()
                        .then(function(student) {
                            res.jsonp({ student: student });
                        });
                }
            });
    });

    app.post('/studentInfo/edit', checkJSONLogin);
    app.post('/studentInfo/edit', function(req, res) {
        var studentInfo = new StudentInfo({
            name: req.body.name,
            mobile: req.body.mobile,
            sex: req.body.sex,
            School: req.body.School,
            className: req.body.className,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName
        });

        studentInfo.update(req.body.id, function(err, result) {
            if (err) {
                studentInfo = {};
            }
            res.jsonp({ succeed: true });
        });
    });

    app.post('/studentInfo/delete', checkJSONLogin);
    app.post('/studentInfo/delete', function(req, res) {
        StudentInfo.delete(req.body.id, function(err, studentInfo) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/studentInfo/coupon', checkJSONLogin);
    app.post('/studentInfo/coupon', function(req, res) {
        TrainClass.get(req.body.classId).then(function(trainClass) {
            StudentInfo.get(req.body.studentId).then(function(student) {
                var now = new Date((new Date()).toLocaleDateString());
                var filter = {
                    studentId: req.body.studentId,
                    gradeId: trainClass.gradeId,
                    subjectId: trainClass.subjectId,
                    isUsed: { $ne: true },
                    couponEndDate: { $gte: now }
                };
                CouponAssign.getAllWithoutPage(filter).then(function(assigns) {
                    res.jsonp({
                        student: student,
                        assigns: assigns
                    });
                });
            });
        });
    });

    app.get('/personalCenter/students', checkLogin);
    app.get('/personalCenter/students', function(req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_students.html', {
            title: '学员',
            user: req.session.user
        });
    });

    app.get('/personalCenter/coupon', checkLogin);
    app.get('/personalCenter/coupon', function(req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_coupon.html', {
            title: '优惠券列表',
            user: req.session.user
        });
    });

    app.get('/personalCenter/order', checkLogin);
    app.get('/personalCenter/order', function(req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_order.html', {
            title: '订单列表',
            user: req.session.user
        });
    });

    app.get('/personalCenter/exam', checkLogin);
    app.get('/personalCenter/exam', function(req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_exam.html', {
            title: '测试列表',
            user: req.session.user
        });
    });

    app.post('/personalCenter/coupon/all', checkJSONLogin);
    app.post('/personalCenter/coupon/all', function(req, res) {
        var currentUser = req.session.user;
        StudentInfo.getFilters({ accountId: currentUser._id }).then(function(students) {
            var now = new Date((new Date()).toLocaleDateString());
            if (students.length <= 0) {
                res.jsonp([]);
                return;
            }
            var coupons = [],
                parray = [];
            students.forEach(function(student) {
                var filter = {
                    studentId: student._id,
                    isUsed: { $ne: true },
                    couponEndDate: { $gte: now }
                };
                var p = CouponAssign.getAllWithoutPage(filter)
                    .then(function(assigns) {
                        assigns.forEach(function(assign) {
                            coupons.push({ studentName: student.name, couponName: assign.couponName });
                        });
                    });
                parray.push(p);
            });
            Promise.all(parray).then(function() {
                res.jsonp(coupons);
                return;
            });
        });
    });

    app.get('/enroll/exam/card/:id', checkLogin);
    app.get('/enroll/exam/card/:id', function(req, res) {
        ExamClass.get(req.params.id).then(function(train) {
                if (train) {
                    var currentUser = req.session.user;
                    StudentInfo.getFilters({ accountId: currentUser._id })
                        .then(function(students) {
                            if (students && students.length > 0) {
                                var pArray = [];
                                students.forEach(function(student) {
                                    student.accountMobile = currentUser.name;
                                    var p = AdminEnrollExam.getFilter({
                                        studentId: student._id,
                                        examId: train._id,
                                        isSucceed: 1
                                    }).then(function(order) {
                                        if (order) {
                                            student.order = order;
                                            if (order.classRoomId) {
                                                return ClassRoom.get(order.classRoomId).then(function(classRoom) {
                                                    if (classRoom) {
                                                        order.room = classRoom;
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    pArray.push(p);
                                });

                                Promise.all(pArray).then(function() {
                                    res.render('Client/enroll_exam_card.html', {
                                        title: '准考证',
                                        user: req.session.user,
                                        train: train,
                                        students: students
                                    });
                                }).catch(function(error) {
                                    res.render('error.html', {
                                        title: '准考证',
                                        error: error
                                    });
                                });
                            } else {
                                res.render('Client/enroll_exam_card.html', {
                                    title: '准考证',
                                    user: req.session.user,
                                    train: train
                                });
                            }
                        }).catch(function(error) {
                            res.render('error.html', {
                                title: '准考证',
                                error: error
                            });
                        });
                }
            })
            .catch(function(error) {
                res.render('error.html', {
                    title: '准考证',
                    error: error
                });
            });
    });

    app.get('/enroll/exam/score/:id', checkLogin);
    app.get('/enroll/exam/score/:id', function(req, res) {
        ExamClass.get(req.params.id).then(function(train) {
                if (train) {
                    var currentUser = req.session.user;
                    StudentInfo.getFilters({ accountId: currentUser._id })
                        .then(function(students) {
                            if (students && students.length > 0) {
                                var pArray = [];
                                students.forEach(function(student) {
                                    var p = AdminEnrollExam.getFilter({
                                        studentId: student._id,
                                        examId: train._id,
                                        isSucceed: 1
                                    }).then(function(order) {
                                        if (order) {
                                            student.order = order;
                                            if (order.classRoomId) {
                                                return ClassRoom.get(order.classRoomId).then(function(classRoom) {
                                                    if (classRoom) {
                                                        order.room = classRoom;
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    pArray.push(p);
                                });

                                Promise.all(pArray).then(function() {
                                    res.render('Client/enroll_exam_score.html', {
                                        title: '成绩',
                                        user: req.session.user,
                                        train: train,
                                        students: students
                                    });
                                }).catch(function(error) {
                                    res.render('error.html', {
                                        title: '成绩',
                                        error: error
                                    });
                                });
                            } else {
                                res.render('Client/enroll_exam_score.html', {
                                    title: '成绩',
                                    user: req.session.user,
                                    train: train
                                });
                            }
                        }).catch(function(error) {
                            res.render('error.html', {
                                title: '成绩',
                                error: error
                            });
                        });
                }
            })
            .catch(function(error) {
                res.render('error.html', {
                    title: '成绩',
                    error: error
                });
            });
    });
}