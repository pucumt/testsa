var ExamClass = require('../../models/examClass.js'),
    TrainClass = require('../../models/trainClass.js'),
    AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    SchoolArea = require('../../models/schoolArea.js'),
    Grade = require('../../models/grade.js'),
    Subject = require('../../models/subject.js'),
    Category = require('../../models/category.js'),
    CouponAssign = require('../../models/couponAssign.js'),
    ExamClassExamArea = require('../../models/examClassExamArea.js'),
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

    app.get('/enrollClass/schoolId/:schoolId/gradeId/:gradeId/subjectId/:subjectId/categoryId/:categoryId', function(req, res) {
        res.render('Client/enroll_class.html', {
            title: '课程报名',
            user: req.session.user,
            schoolId: req.params.schoolId,
            gradeId: req.params.gradeId,
            subjectId: req.params.subjectId,
            categoryId: req.params.categoryId
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

    app.post('/enroll/class', function(req, res) {
        //debugger;
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var filter = { isWeixin: 1 };
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        if (req.body.gradeId) {
            filter.gradeId = req.body.gradeId;
        }
        if (req.body.subjectId) {
            filter.subjectId = req.body.subjectId;
        }
        if (req.body.categoryId) {
            filter.categoryId = req.body.categoryId;
        }
        //查询并返回第 page 页的 14 篇文章
        TrainClass.getAllToEnroll(null, page, filter, function(err, classs, total) {
            if (err) {
                classs = [];
            }
            res.jsonp({
                classs: classs,
                isLastPage: ((page - 1) * 14 + classs.length) == total
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

    app.get('/enroll/class/:id', function(req, res) {
        TrainClass.get(req.params.id).then(function(trainClass) {
            res.render('Client/enroll_class_detail.html', {
                title: '课程报名',
                trainClass: trainClass
            });
        });
    });

    app.post('/enroll/exam/enroll', checkLogin);
    app.post('/enroll/exam/enroll', function(req, res) {
        ExamClass.get(req.body.examId)
            .then(function(examClass) {
                if (examClass) {
                    //studentId
                    AdminEnrollExam.getByStudentAndCategory(req.body.studentId, examClass.examCategoryId, examClass._id)
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
                        });
                }
            });
    });

    app.post('/enroll/exam/enroll2', checkLogin);
    app.post('/enroll/exam/enroll2', function(req, res) {
        ExamClass.get(req.body.examId)
            .then(function(examClass) {
                if (examClass) {
                    //studentId
                    AdminEnrollExam.getByStudentAndCategory(req.body.studentId, examClass.examCategoryId, examClass._id)
                        .then(function(enrollExam) {
                            if (enrollExam) {
                                res.jsonp({ error: "你已经报过名了，此测试不允许多次报名" });
                                return;
                            }
                            StudentInfo.get(req.body.studentId)
                                .then(function(student) {
                                    ExamClassExamArea.enroll(req.body.examClassExamAreaId)
                                        .then(function(result) {
                                            if (result && result.ok && result.nModified == 1) {
                                                //报名成功
                                                //更新总数，更新订单
                                                ExamClass.enroll2(req.body.examId);

                                                ExamClassExamArea.get(req.body.examClassExamAreaId)
                                                    .then(function(examClassExamArea) {
                                                        var adminEnrollExam = new AdminEnrollExam({
                                                            studentId: student._id,
                                                            studentName: student.name,
                                                            mobile: student.mobile,
                                                            examId: examClass._id,
                                                            examName: examClass.name,
                                                            examCategoryId: examClass.examCategoryId,
                                                            examCategoryName: examClass.examCategoryName,
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
                        });
                }
            });
    });

    app.post('/enroll/students', checkJSONLogin);
    app.post('/enroll/students', function(req, res) {
        var filter = { accountId: req.session.user._id };
        StudentInfo.getFilters(filter)
            .then(function(students) {
                res.jsonp({ students: students });
                return;
            });
    });

    app.get('/enroll/exam/examClassExamAreas/:id', function(req, res) {
        ExamClassExamArea.getFilters({ examId: req.params.id })
            .then(function(examClassExamAreas) {
                res.jsonp(examClassExamAreas);
            });
    });

    app.get('/enroll/schoolgradesubjectcategory', function(req, res) {
        var objReturn = {};
        var p0 = SchoolArea.getAllWithoutPage()
            .then(function(schools) {
                objReturn.schools = schools;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p1 = Grade.getAllWithoutPage()
            .then(function(grades) {
                objReturn.grades = grades;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p2 = Subject.getAllWithoutPage()
            .then(function(subjects) {
                objReturn.subjects = subjects;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p3 = Category.getAllWithoutPage()
            .then(function(categorys) {
                objReturn.categorys = categorys;
            })
            .catch((err) => {
                console.log('errored');
            });
        Promise.all([p0, p1, p2, p3]).then(function() {
                res.jsonp(objReturn);
            })
            .catch((err) => {
                console.log('errored');
            });
    });

    app.get('/enroll/grade/all', function(req, res) {
        Grade.getAllWithoutPage()
            .then(function(grades) {
                res.jsonp(grades);
                return;
            })
            .catch((err) => {
                console.log('errored');
            });
    });

    app.get('/enroll/order', checkLogin);
    app.get('/enroll/order', function(req, res) {
        //req.query.classId studentId
        TrainClass.get(req.query.classId).then(function(trainClass) {
            if (trainClass.exams && trainClass.exams.length > 0) {
                var pArray = [];
                trainClass.exams.forEach(function(exam) {
                    var p = AdminEnrollExam.getFilter({ examId: exam.examId, studentId: req.query.studentId, isSucceed: 1 })
                        .then(function(examOrder) {
                            if (examOrder) {
                                var subjectScore = examOrder.scores.filter(function(score) {
                                    return score.subjectId == trainClass.subjectId;
                                })[0];
                                if (subjectScore.score >= exam.minScore) {
                                    return true;
                                }
                            }
                        });
                    pArray.push(p);
                });
                Promise.all(pArray).then(function(results) {
                    if (results.some(function(result) {
                            return result;
                        })) {
                        res.render('Client/enroll_class_order.html', {
                            title: '课程报名',
                            trainClass: trainClass,
                            classId: req.query.classId,
                            studentId: req.query.studentId
                        });
                    } else {
                        res.render('Client/enroll_class_order.html', {
                            title: '课程报名',
                            trainClass: trainClass,
                            classId: req.query.classId,
                            studentId: req.query.studentId,
                            disability: true
                        });
                    }
                });
            } else {
                res.render('Client/enroll_class_order.html', {
                    title: '课程报名',
                    trainClass: trainClass,
                    classId: req.query.classId,
                    studentId: req.query.studentId
                });
            }
        });
    });

    app.post('/enroll/pay', checkJSONLogin);
    app.post('/enroll/pay', function(req, res) {
        AdminEnrollTrain.getByStudentAndClass(req.body.studentId, req.body.classId)
            .then(function(enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({ error: "你已经报过名了，此课程不允许多次报名" });
                    return;
                }

                TrainClass.enroll(req.body.classId)
                    .then(function(resultClass) {
                        if (resultClass && resultClass.ok && resultClass.nModified == 1) {
                            //报名成功
                            TrainClass.get(req.body.classId).then(function(trainClass) {
                                StudentInfo.get(req.body.studentId).then(function(student) {
                                    var coupon = req.body.coupon,
                                        price, p;
                                    if (coupon) {
                                        if (coupon == "0") {
                                            price = Math.round(trainClass.trainPrice * student.discount) / 100;
                                            p = Promise.resolve(price);
                                        } else {
                                            p = CouponAssign.get(coupon).then(function(assign) {
                                                price = trainClass.trainPrice - assign.reducePrice;
                                                return price > 0 ? price : 0;
                                            });
                                        }
                                    } else {
                                        p = Promise.resolve(trainClass.trainPrice);
                                    }
                                    p.then(function(totalPrice) {
                                        var adminEnrollTrain = new AdminEnrollTrain({
                                            studentId: student._id,
                                            studentName: student.name,
                                            mobile: student.mobile,
                                            trainId: trainClass._id,
                                            trainName: trainClass.name,
                                            trainPrice: trainClass.trainPrice,
                                            materialPrice: trainClass.materialPrice,
                                            discount: student.discount,
                                            totalPrice: totalPrice.toFixed(2),
                                            realMaterialPrice: trainClass.materialPrice,
                                            isSucceed: 1
                                        });
                                        adminEnrollTrain.save()
                                            .then(function(enrollExam) {
                                                //修改优惠券状态
                                                if (coupon && coupon != "0") {
                                                    CouponAssign.use(coupon, enrollExam._id);
                                                }
                                                res.jsonp({ orderId: enrollExam._id });
                                                return;
                                            });
                                    });
                                });
                            });
                        } else {
                            //报名失败
                            res.jsonp({ error: "报名失败,很可能报满" });
                            return;
                        }
                    });
            });
    });
};