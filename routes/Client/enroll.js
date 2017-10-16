var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ExamClass = model.examClass,
    TrainClass = model.trainClass,
    TrainClassExams = model.trainClassExams,
    AdminEnrollExam = model.adminEnrollExam,
    AdminEnrollTrain = model.adminEnrollTrain,
    StudentInfo = model.studentInfo,
    SchoolArea = model.schoolArea,
    Grade = model.grade,
    Subject = model.subject,
    Category = model.category,
    CouponAssign = model.couponAssign,
    Coupon = model.coupon,
    ExamClassExamArea = model.examClassExamArea,
    ChangeEnd = model.changeEnd,
    WeekType = model.weekType,
    TimeType = model.timeType,
    moment = require("moment"),
    auth = require("./auth"),
    SchoolGradeRelation = model.schoolGradeRelation,
    GradeSubjectRelation = model.gradeSubjectRelation,
    GradeSubjectCategoryRelation = model.gradeSubjectCategoryRelation,
    EnrollProcessConfigure = model.enrollProcessConfigure,
    Year = model.year,
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin; // TBD

module.exports = function (app) {
    app.get('/enrollExam', function (req, res) {
        res.render('Client/enroll_exam.html', {
            title: '考试报名',
            user: req.session.user
        });
    });

    app.get('/enrollClass', function (req, res) {
        res.render('Client/enroll_class.html', {
            title: '课程报名',
            user: req.session.user,
            schoolId: req.query.schoolId,
            gradeId: req.query.gradeId,
            subjectId: req.query.subjectId,
            categoryId: req.query.categoryId
        });
    });

    app.get('/enrollOriginalClass', function (req, res) {
        res.render('Client/enroll_originalclass.html', {
            title: '课程报名',
            user: req.session.user
        });
    });

    app.get('/enroll/exam', function (req, res) {
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 14 篇文章
        ExamClass.getFiltersWithPage(page, {
            isWeixin: 1
        }).then(function (result) {
            res.jsonp({
                examClasss: result.rows,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/enroll/class', function (req, res) {
        //debugger;
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var filter = {
            isWeixin: 1,
            yearId: global.currentYear._id
        };
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
        TrainClass.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                classs: result.rows,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/enroll/filterClasses', function (req, res) {
        //debugger;
        var filter = {
            isWeixin: 1,
            yearId: global.currentYear._id
        };
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
        if (req.body.timespan) {
            filter.courseTime = {
                $like: `%${req.body.timespan.trim()}%`
            };
        }
        TrainClass.getFilters(filter)
            .then(function (classs) {
                res.jsonp({
                    classs: classs
                });
            });
    });

    // 老生调班对应班级
    app.get('/enroll/originalclass/switch/:orderId', function (req, res) {
        res.render('Client/enroll_originalclass_switch.html', {
            title: '课程报名',
            user: req.session.user,
            orderId: req.params.orderId,
            schoolId: req.query.school,
            categoryId: req.query.category
        });
    });

    // 老生调班功能
    app.post('/enroll/originalclass/switch', function (req, res) {
        //debugger;
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var filter = {
            isWeixin: 1,
            yearId: global.currentYear._id
        }; //依赖发布报班
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
        TrainClass.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                classs: result.rows,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    // 原班对应新班
    app.get('/enroll/originalclass/classes/:trainId/student/:studentId', function (req, res) {
        res.render('Client/enroll_originalclass_classes.html', {
            title: '课程报名',
            user: req.session.user,
            trainId: req.params.trainId,
            studentId: req.params.studentId
        });
    });

    // 原班对应新班
    app.post('/enroll/originalclass/classes', function (req, res) {
        //debugger;
        // number 类型
        var filter = {
            isWeixin: 1
        }; //isWeixin: 1
        if (req.body.fromClassId) {
            filter.fromClassId = req.body.fromClassId;
        }
        TrainClass.getFilters(filter)
            .then(function (classes) {
                res.jsonp({
                    classs: classes
                });
            });
    });

    app.get('/enroll/exam/:id', function (req, res) {
        ExamClass.getFilter({
                _id: req.params.id
            })
            .then(function (exam) {
                res.render('Client/enroll_exam_detail.html', {
                    title: '考试报名',
                    exam: exam,
                    isExpired: ((new Date((new Date()).toLocaleDateString())) > exam.examDate)
                });
            });
    });

    app.get('/enroll/class/:id', function (req, res) {
        TrainClass.getFilter({
                _id: req.params.id
            })
            .then(function (trainClass) {
                var totalPrice = (parseFloat(trainClass.trainPrice) + parseFloat(trainClass.materialPrice)).toFixed(2);
                res.render('Client/enroll_class_detail.html', {
                    title: '课程报名',
                    trainClass: trainClass,
                    totalPrice: totalPrice
                });
            });
    });

    app.get('/enroll/originalclass/id/:trainId/student/:studentId', function (req, res) {
        TrainClass.getFilter({
                _id: req.params.trainId
            })
            .then(function (trainClass) {
                var totalPrice = (parseFloat(trainClass.trainPrice) + parseFloat(trainClass.materialPrice)).toFixed(2);
                res.render('Client/enroll_originalclass_detail.html', {
                    title: '原班升报课程报名',
                    trainClass: trainClass,
                    totalPrice: totalPrice,
                    studentId: req.params.studentId,
                    orderId: req.query.orderId
                });
            });
    });

    // 测试报名
    app.post('/enroll/exam/enroll', checkLogin);
    app.post('/enroll/exam/enroll', function (req, res) {
        ExamClass.getFilter({
                _id: req.body.examId
            })
            .then(function (examClass) {
                if (examClass) {
                    var strQuery = "select count(0) as count from adminEnrollExams \
                        where isDeleted=false and isSucceed=1 and studentId=:studentId ";
                    if (examClass.examCategoryId) {
                        strQuery += " and examCategoryId=:examCategoryId ";
                    } else {
                        strQuery += " and examId=:examId ";
                    }
                    return model.db.sequelize.query(strQuery, {
                            replacements: {
                                studentId: req.body.studentId,
                                examCategoryId: examClass.examCategoryId,
                                examId: examClass._id
                            },
                            type: model.db.sequelize.QueryTypes.SELECT
                        })
                        .then(function (result) {
                            if (result && result[0] && result[0].count) {
                                // 已经报过名了
                                res.jsonp({
                                    error: "你已经报过名了，此测试不允许多次报名"
                                });
                            } else {
                                return ExamClassExamArea.getFilter({
                                        _id: req.body.examClassExamAreaId
                                    })
                                    .then(function (examClassExamArea) {
                                        if (examClassExamArea.enrollCount < examClassExamArea.examCount) {
                                            return StudentInfo.getFilter({
                                                    _id: req.body.studentId
                                                })
                                                .then(function (student) {
                                                    // 1. 查看名额并修改
                                                    // 2. 生成订单
                                                    model.db.sequelize.transaction(function (t1) {
                                                            return ExamClassExamArea.update({
                                                                    enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                                                }, {
                                                                    where: {
                                                                        _id: req.body.examClassExamAreaId,
                                                                        enrollCount: model.db.sequelize.literal('`enrollCount`<`examCount`')
                                                                    },
                                                                    transaction: t1
                                                                })
                                                                .then(function (updateResult) {
                                                                    if (updateResult && updateResult[0]) {
                                                                        return ExamClass.update({
                                                                                enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                                                            }, {
                                                                                where: {
                                                                                    _id: req.body.examId
                                                                                },
                                                                                transaction: t1
                                                                            })
                                                                            .then(function () {
                                                                                return AdminEnrollExam.create({
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
                                                                            });
                                                                    } else {
                                                                        return {
                                                                            error: "报名失败,很可能此考点已报满"
                                                                        };
                                                                    }
                                                                });
                                                        })
                                                        .then(function (order) {
                                                            if (order.error) {
                                                                res.jsonp(order);
                                                            } else {
                                                                res.jsonp({
                                                                    sucess: true
                                                                });
                                                            }
                                                        })
                                                        .catch(function (err) {
                                                            res.jsonp({
                                                                error: "报名失败"
                                                            });
                                                        });
                                                });
                                        } else {
                                            res.jsonp({
                                                error: "此考点已报满"
                                            });
                                        }
                                    });
                            }
                        });
                }
            });
    });

    app.post('/enroll/students', checkJSONLogin);
    app.post('/enroll/students', function (req, res) {
        var filter = {
            accountId: req.session.user._id
        };
        StudentInfo.getFilters(filter)
            .then(function (students) {
                res.jsonp({
                    students: students
                });
                return;
            });
    });

    app.get('/enroll/exam/examClassExamAreas/:id', function (req, res) {
        ExamClassExamArea.getFilters({
                examId: req.params.id
            })
            .then(function (examClassExamAreas) {
                res.jsonp(examClassExamAreas);
            });
    });

    app.get('/enroll/schoolgradesubjectcategory', function (req, res) {
        EnrollProcessConfigure.getFilter({})
            .then(function (configure) {
                if (configure && (!configure.newStudentStatus)) {
                    res.jsonp({
                        error: "没到报名时间呢！"
                    });
                } else {
                    var objReturn = {};
                    var p0 = SchoolArea.getFilters({})
                        .then(function (schools) {
                            objReturn.schools = schools;
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                    var p1 = Grade.getFilters({})
                        .then(function (grades) {
                            objReturn.grades = grades;
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                    var p2 = Subject.getFilters({})
                        .then(function (subjects) {
                            objReturn.subjects = subjects;
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                    var p3 = Category.getFilters({})
                        .then(function (categorys) {
                            objReturn.categorys = categorys;
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                    var p4 = SchoolGradeRelation.getFilters({})
                        .then(function (schoolGradeRelations) {
                            objReturn.schoolGradeRelations = schoolGradeRelations;
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                    var p5 = GradeSubjectRelation.getFilters({})
                        .then(function (gradeSubjectRelations) {
                            objReturn.gradeSubjectRelations = gradeSubjectRelations;
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                    var p6 = GradeSubjectCategoryRelation.getFilters({})
                        .then(function (gradeSubjectCategoryRelations) {
                            objReturn.gradeSubjectCategoryRelations = gradeSubjectCategoryRelations;
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                    Promise.all([p0, p1, p2, p3, p4, p5, p6])
                        .then(function () {
                            res.jsonp(objReturn);
                        })
                        .catch(function (err) {
                            console.log('errored');
                        });
                }
            });
    });

    app.post('/enroll/changeclass/school', function (req, res) {
        var objReturn = {};
        var p0 = SchoolGradeRelation.getFilters({
                gradeId: req.body.gradeId
            })
            .then(function (relations) {
                var schoolIds = relations.map(function (relation) {
                    return relation.schoolId;
                });
                return SchoolArea.getFilters({
                        _id: {
                            $in: schoolIds
                        }
                    })
                    .then(function (schools) {
                        objReturn.schools = schools;
                    });
            }).catch(function (err) {
                console.log('errored');
            });
        var p1 = WeekType.getFilters({
                isChecked: true
            })
            .then(function (weekTypes) {
                objReturn.weekTypes = weekTypes;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p2 = TimeType.getFilters({
                isChecked: true
            })
            .then(function (timeTypes) {
                objReturn.timeTypes = timeTypes;
            })
            .catch(function (err) {
                console.log('errored');
            });
        Promise.all([p0, p1, p2]).then(function () {
                res.jsonp(objReturn);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.get('/enroll/grade/all', function (req, res) {
        Grade.getFilters({})
            .then(function (grades) {
                res.jsonp(grades);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    // 报名订单
    app.get('/enroll/order', checkLogin);
    app.get('/enroll/order', function (req, res) {
        // req.query.classId studentId
        TrainClass.getFilter({
                _id: req.query.classId
            })
            .then(function (trainClass) {
                // get history orders to check the class time
                return model.db.sequelize.query("select count(0) as count from adminEnrollTrains O join trainClasss C \
                        on O.trainId=C._id \
                        where O.yearId=:yearId and O.studentId=:studentId and O.isDeleted=false and O.isSucceed=1 and \
                        C.courseTime=:courseTime", {
                        replacements: {
                            yearId: global.currentYear._id,
                            studentId: req.query.studentId,
                            courseTime: trainClass.courseTime
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (result) {
                        var isTimeDuplicated = null;
                        if (result && result[0] && result[0].count) {
                            isTimeDuplicated = true;
                        }
                        return TrainClassExams.getFilter({
                                trainClassId: trainClass._id
                            })
                            .then(function (exam) {
                                if (exam) {
                                    return model.db.sequelize.query("select count(0) as count from trainClassExams E left join trainClasss C\
                                            on E.trainClassId=C._id left join adminEnrollExams M on E.examId=M.examId and M.isDeleted=false and M.isSucceed=1\
                                            and M.studentId=:studentId left join adminEnrollExamScores S \
                                            on M._id=S.examOrderId and C.subjectId=S.subjectId and S.isDeleted=false \
                                            where E.trainClassId=:id and S.score>=E.minScore", {
                                            replacements: {
                                                studentId: req.query.studentId,
                                                id: trainClass._id
                                            },
                                            type: model.db.sequelize.QueryTypes.SELECT
                                        })
                                        .then(function (scoreResult) {
                                            if (scoreResult && scoreResult[0] && scoreResult[0].count) {
                                                //达到最低分数
                                                res.render('Client/enroll_class_order.html', {
                                                    title: '课程报名',
                                                    trainClass: trainClass,
                                                    classId: req.query.classId,
                                                    studentId: req.query.studentId,
                                                    isTimeDuplicated: isTimeDuplicated
                                                });
                                            } else {
                                                //没有达到最低分数要求
                                                res.render('Client/enroll_class_order.html', {
                                                    title: '课程报名',
                                                    trainClass: trainClass,
                                                    classId: req.query.classId,
                                                    studentId: req.query.studentId,
                                                    disability: 1
                                                });
                                            }
                                        });
                                } else {
                                    //不需要依赖考试分数
                                    res.render('Client/enroll_class_order.html', {
                                        title: '课程报名',
                                        trainClass: trainClass,
                                        classId: req.query.classId,
                                        studentId: req.query.studentId,
                                        isTimeDuplicated: isTimeDuplicated
                                    });
                                }
                            });
                    });
            });
    });

    // TBD 原班报名订单确认
    app.get('/enroll/original/order', checkLogin);
    app.get('/enroll/original/order', function (req, res) {
        //req.query.classId studentId
        TrainClass.get(req.query.classId).then(function (trainClass) {
            AdminEnrollTrain.getFilter({
                    trainId: trainClass.fromClassId,
                    studentId: req.query.studentId,
                    isSucceed: 1
                })
                .then(function (order) {
                    if (order) {
                        //有原班，可以继续报名
                        //get history orders to check the class time
                        AdminEnrollTrain.getFiltersWithClassFilters({
                            yearId: global.currentYear._id.toJSON(),
                            studentId: req.query.studentId,
                            isSucceed: 1
                        }, {
                            "trainClasss.courseTime": trainClass.courseTime
                        }).then(function (existOrders) {
                            var isTimeDuplicated = null;
                            if (existOrders && existOrders.length > 0) {
                                isTimeDuplicated = true;
                            }

                            if (trainClass.exams && trainClass.exams.length > 0) {
                                var pArray = [],
                                    minScore;
                                trainClass.exams.forEach(function (exam) {
                                    minScore = exam.minScore;
                                    var p = AdminEnrollExam.getFilter({
                                            examId: exam.examId,
                                            studentId: req.query.studentId,
                                            isSucceed: 1
                                        })
                                        .then(function (examOrder) {
                                            if (examOrder) {
                                                var subjectScore = examOrder.scores.filter(function (score) {
                                                    return score.subjectId == trainClass.subjectId;
                                                })[0];
                                                if (subjectScore.score >= exam.minScore) {
                                                    return true;
                                                }
                                            }
                                        });
                                    pArray.push(p);
                                });
                                Promise.all(pArray).then(function (results) {
                                    if (results.some(function (result) {
                                            return result;
                                        })) {
                                        //达到分数，可以报名
                                        res.render('Client/enroll_originalclass_order.html', {
                                            title: '课程报名',
                                            trainClass: trainClass,
                                            classId: req.query.classId,
                                            studentId: req.query.studentId,
                                            originalOrder: 1,
                                            isTimeDuplicated: isTimeDuplicated,
                                            orderId: req.query.orderId
                                        });
                                    } else {
                                        //未到分数线，不能报名
                                        res.render('Client/enroll_originalclass_order.html', {
                                            title: '课程报名',
                                            trainClass: trainClass,
                                            classId: req.query.classId,
                                            studentId: req.query.studentId,
                                            disability: minScore,
                                            originalOrder: 1,
                                            orderId: req.query.orderId
                                        });
                                    }
                                });
                            } else {
                                //没有考试依赖，可以报名
                                res.render('Client/enroll_originalclass_order.html', {
                                    title: '课程报名',
                                    trainClass: trainClass,
                                    classId: req.query.classId,
                                    studentId: req.query.studentId,
                                    originalOrder: 1,
                                    isTimeDuplicated: isTimeDuplicated,
                                    orderId: req.query.orderId
                                });
                            }
                        });
                    } else {
                        //没有原班
                        if (req.query.orderId) {
                            //调班报名
                            //get history orders to check the class time
                            AdminEnrollTrain.getFiltersWithClassFilters({
                                yearId: global.currentYear._id.toJSON(),
                                studentId: req.query.studentId,
                                isSucceed: 1
                            }, {
                                "trainClasss.courseTime": trainClass.courseTime
                            }).then(function (existOrders) {
                                var isTimeDuplicated = null;
                                if (existOrders && existOrders.length > 0) {
                                    isTimeDuplicated = true;
                                }

                                if (trainClass.exams && trainClass.exams.length > 0) {
                                    var pArray = [],
                                        minScore;
                                    trainClass.exams.forEach(function (exam) {
                                        minScore = exam.minScore;
                                        var p = AdminEnrollExam.getFilter({
                                                examId: exam.examId,
                                                studentId: req.query.studentId,
                                                isSucceed: 1
                                            })
                                            .then(function (examOrder) {
                                                if (examOrder) {
                                                    var subjectScore = examOrder.scores.filter(function (score) {
                                                        return score.subjectId == trainClass.subjectId;
                                                    })[0];
                                                    if (subjectScore.score >= exam.minScore) {
                                                        return true;
                                                    }
                                                }
                                            });
                                        pArray.push(p);
                                    });
                                    Promise.all(pArray).then(function (results) {
                                        if (results.some(function (result) {
                                                return result;
                                            })) {
                                            //达到分数，可以报名
                                            res.render('Client/enroll_originalclass_order.html', {
                                                title: '课程报名',
                                                trainClass: trainClass,
                                                classId: req.query.classId,
                                                studentId: req.query.studentId,
                                                originalOrder: 1,
                                                isTimeDuplicated: isTimeDuplicated,
                                                orderId: req.query.orderId
                                            });
                                        } else {
                                            //未到分数线，不能报名
                                            res.render('Client/enroll_originalclass_order.html', {
                                                title: '课程报名',
                                                trainClass: trainClass,
                                                classId: req.query.classId,
                                                studentId: req.query.studentId,
                                                disability: minScore,
                                                originalOrder: 1,
                                                orderId: req.query.orderId
                                            });
                                        }
                                    });
                                } else {
                                    //没有考试依赖，可以报名
                                    res.render('Client/enroll_originalclass_order.html', {
                                        title: '课程报名',
                                        trainClass: trainClass,
                                        classId: req.query.classId,
                                        studentId: req.query.studentId,
                                        originalOrder: 1,
                                        isTimeDuplicated: isTimeDuplicated,
                                        orderId: req.query.orderId
                                    });
                                }
                            });
                        } else {
                            //不能报名
                            res.render('Client/enroll_originalclass_order.html', {
                                title: '课程报名',
                                trainClass: trainClass,
                                classId: req.query.classId,
                                studentId: req.query.studentId,
                                notOriginal: 1,
                                originalOrder: 1,
                                orderId: req.query.orderId
                            });
                        }
                    }
                });
        });
    });

    // TBD 支付订单
    app.post('/enroll/pay', checkJSONLogin);
    app.post('/enroll/pay', function (req, res) {
        AdminEnrollTrain.getByStudentAndClass(req.body.studentId, req.body.classId)
            .then(function (enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({
                        error: "你已经报过名了，将跳转到订单页!"
                    });
                    return;
                }
                TrainClass.enroll(req.body.classId)
                    .then(function (resultClass) {
                        if (resultClass && resultClass.ok && resultClass.nModified == 1) {
                            //报名成功
                            TrainClass.get(req.body.classId).then(function (trainClass) {
                                if (trainClass.enrollCount == trainClass.totalStudentCount) {
                                    TrainClass.full(req.body.classId);
                                    //updated to full
                                }

                                StudentInfo.get(req.body.studentId).then(function (student) {
                                    var coupon = req.body.coupon,
                                        price, p;
                                    if (coupon) {
                                        if (coupon == "0") {
                                            price = Math.round(trainClass.trainPrice * student.discount) / 100;
                                            p = Promise.resolve(price);
                                        } else {
                                            p = CouponAssign.get(coupon).then(function (assign) {
                                                if (assign) {
                                                    price = trainClass.trainPrice - assign.reducePrice;
                                                    return price > 0 ? price : 0;
                                                } else {
                                                    return Coupon.get(coupon).then(function (couponObject) {
                                                        if (couponObject) {
                                                            price = trainClass.trainPrice - couponObject.reducePrice;
                                                            return price > 0 ? price : 0;
                                                        } else {
                                                            return trainClass.trainPrice;
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    } else {
                                        p = Promise.resolve(trainClass.trainPrice);
                                    }
                                    p.then(function (totalPrice) {
                                        var adminEnrollTrain = new AdminEnrollTrain({
                                            studentId: student._id,
                                            studentName: student.name,
                                            mobile: student.mobile,
                                            trainId: trainClass._id,
                                            trainName: trainClass.name,
                                            trainPrice: trainClass.trainPrice,
                                            materialPrice: trainClass.materialPrice,
                                            discount: (student.discount | 100),
                                            totalPrice: totalPrice.toFixed(2),
                                            realMaterialPrice: trainClass.materialPrice,
                                            attributeId: trainClass.attributeId,
                                            attributeName: trainClass.attributeName,
                                            isSucceed: 1,
                                            payWay: req.body.payWay,
                                            yearId: trainClass.yearId,
                                            yearName: trainClass.yearName,
                                            schoolId: trainClass.schoolId,
                                            schoolArea: trainClass.schoolArea
                                        });
                                        adminEnrollTrain.save()
                                            .then(function (enrollExam) {
                                                //修改优惠券状态
                                                if (coupon && coupon != "0") {
                                                    CouponAssign.get(coupon)
                                                        .then(function (couponAssign) {
                                                            if (couponAssign) {
                                                                CouponAssign.use(coupon, enrollExam._id);
                                                                res.jsonp({
                                                                    orderId: enrollExam._id
                                                                });
                                                                return;
                                                            } else {
                                                                //报名3科减
                                                                Coupon.get(coupon)
                                                                    .then(function (coupon) {
                                                                        var couponAssign = new CouponAssign({
                                                                            couponId: coupon._id,
                                                                            couponName: coupon.name,
                                                                            gradeId: coupon.gradeId,
                                                                            gradeName: coupon.gradeName,
                                                                            subjectId: coupon.subjectId,
                                                                            subjectName: coupon.subjectName,
                                                                            reducePrice: coupon.reducePrice,
                                                                            couponStartDate: coupon.couponStartDate,
                                                                            couponEndDate: coupon.couponEndDate,
                                                                            studentId: req.body.studentId,
                                                                            studentName: student.name,
                                                                            isUsed: true,
                                                                            orderId: enrollExam._id,
                                                                            createdBy: req.session.user._id
                                                                        });
                                                                        couponAssign.save().then(function (couponAssign) {
                                                                            res.jsonp({
                                                                                orderId: enrollExam._id
                                                                            });
                                                                            return;
                                                                        });
                                                                    });
                                                            }
                                                        });

                                                } else {
                                                    res.jsonp({
                                                        orderId: enrollExam._id
                                                    });
                                                    return;
                                                }
                                            });
                                    });
                                });
                            });
                        } else {
                            //报名失败
                            res.jsonp({
                                error: "报名失败,很可能报满"
                            });
                            return;
                        }
                    });
            });
    });

    // TBD 原班报名支付
    app.post('/enroll/original/pay', checkJSONLogin);
    app.post('/enroll/original/pay', function (req, res) {
        AdminEnrollTrain.getByStudentAndClass(req.body.studentId, req.body.classId)
            .then(function (enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({
                        error: "你已经报过名了，将跳转到订单页!"
                    });
                    return;
                }
                TrainClass.adminEnroll(req.body.classId)
                    .then(function (resultClass) {
                        if (resultClass && resultClass.ok && resultClass.nModified == 1) {
                            //报名成功
                            TrainClass.get(req.body.classId).then(function (trainClass) {
                                if (trainClass.enrollCount == trainClass.totalStudentCount) {
                                    TrainClass.full(req.body.classId);
                                    //updated to full
                                }

                                StudentInfo.get(req.body.studentId).then(function (student) {
                                    var coupon = req.body.coupon,
                                        price, p;
                                    if (coupon) {
                                        if (coupon == "0") {
                                            price = Math.round(trainClass.trainPrice * student.discount) / 100;
                                            p = Promise.resolve(price);
                                        } else {
                                            p = CouponAssign.get(coupon).then(function (assign) {
                                                if (assign) {
                                                    price = trainClass.trainPrice - assign.reducePrice;
                                                    return price > 0 ? price : 0;
                                                } else {
                                                    return Coupon.get(coupon).then(function (couponObject) {
                                                        if (couponObject) {
                                                            price = trainClass.trainPrice - couponObject.reducePrice;
                                                            return price > 0 ? price : 0;
                                                        } else {
                                                            return trainClass.trainPrice;
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    } else {
                                        p = Promise.resolve(trainClass.trainPrice);
                                    }
                                    p.then(function (totalPrice) {
                                        var adminEnrollTrain = new AdminEnrollTrain({
                                            studentId: student._id,
                                            studentName: student.name,
                                            mobile: student.mobile,
                                            trainId: trainClass._id,
                                            trainName: trainClass.name,
                                            trainPrice: trainClass.trainPrice,
                                            materialPrice: trainClass.materialPrice,
                                            discount: (student.discount | 100),
                                            totalPrice: totalPrice.toFixed(2),
                                            realMaterialPrice: trainClass.materialPrice,
                                            attributeId: trainClass.attributeId,
                                            attributeName: trainClass.attributeName,
                                            isSucceed: 1,
                                            payWay: req.body.payWay,
                                            yearId: trainClass.yearId,
                                            yearName: trainClass.yearName,
                                            schoolId: trainClass.schoolId,
                                            schoolArea: trainClass.schoolArea
                                        });
                                        adminEnrollTrain.save()
                                            .then(function (enrollExam) {
                                                //修改优惠券状态
                                                if (coupon && coupon != "0") {
                                                    CouponAssign.get(coupon)
                                                        .then(function (couponAssign) {
                                                            if (couponAssign) {
                                                                CouponAssign.use(coupon, enrollExam._id);
                                                                res.jsonp({
                                                                    orderId: enrollExam._id
                                                                });
                                                                return;
                                                            } else {
                                                                //报名3科减
                                                                Coupon.get(coupon)
                                                                    .then(function (coupon) {
                                                                        var couponAssign = new CouponAssign({
                                                                            couponId: coupon._id,
                                                                            couponName: coupon.name,
                                                                            gradeId: coupon.gradeId,
                                                                            gradeName: coupon.gradeName,
                                                                            subjectId: coupon.subjectId,
                                                                            subjectName: coupon.subjectName,
                                                                            reducePrice: coupon.reducePrice,
                                                                            couponStartDate: coupon.couponStartDate,
                                                                            couponEndDate: coupon.couponEndDate,
                                                                            studentId: req.body.studentId,
                                                                            studentName: student.name,
                                                                            isUsed: true,
                                                                            orderId: enrollExam._id,
                                                                            createdBy: req.session.user._id
                                                                        });
                                                                        couponAssign.save().then(function (couponAssign) {
                                                                            res.jsonp({
                                                                                orderId: enrollExam._id
                                                                            });
                                                                            return;
                                                                        });
                                                                    });
                                                            }
                                                        });

                                                } else {
                                                    res.jsonp({
                                                        orderId: enrollExam._id
                                                    });
                                                    return;
                                                }
                                            });
                                    });
                                });
                            });
                        } else {
                            //报名失败
                            res.jsonp({
                                error: "报名失败,很可能报满"
                            });
                            return;
                        }
                    });
            });
    });

    /// TBD 调班在报名完成后
    app.post('/enroll/changeClass', checkJSONLogin);
    app.post('/enroll/changeClass', function (req, res) {
        ChangeEnd.get().then(function (changeEnd) {
            if (!changeEnd) {
                res.jsonp({
                    error: "没有设置调班截至日期！"
                });
                return;
            }

            AdminEnrollTrain.getFilter({
                isSucceed: 1,
                isPayed: true,
                _id: req.body.orderId,
                yearId: global.currentYear._id.toJSON()
            }).then(function (oldOrder) {
                if (oldOrder) {
                    TrainClass.getFilter({
                        _id: oldOrder.trainId,
                        yearId: global.currentYear._id.toJSON()
                    }).then(function (trainClass) {
                        if (trainClass) {
                            if (moment().isBefore(changeEnd.endDate)) {
                                //could change class
                                //enroll of new class
                                AdminEnrollTrain.getByStudentAndClass(oldOrder.studentId, req.body.trainId)
                                    .then(function (enrollTrain) {
                                        if (enrollTrain) {
                                            res.jsonp({
                                                error: "您已经报过新课程了!"
                                            });
                                            return;
                                        }
                                        TrainClass.enroll(req.body.trainId)
                                            .then(function (resultClass) {
                                                if (resultClass && resultClass.ok && resultClass.nModified == 1) {
                                                    //报名成功
                                                    TrainClass.get(req.body.trainId).then(function (trainClass) {
                                                        if (trainClass.enrollCount == trainClass.totalStudentCount) {
                                                            TrainClass.full(req.body.classId);
                                                            //updated to full
                                                        }
                                                        //new order
                                                        var adminEnrollTrain = new AdminEnrollTrain({
                                                            studentId: oldOrder.studentId,
                                                            studentName: oldOrder.studentName,
                                                            mobile: oldOrder.mobile,
                                                            trainId: trainClass._id,
                                                            trainName: trainClass.name,
                                                            attributeId: trainClass.attributeId,
                                                            attributeName: trainClass.attributeName,
                                                            trainPrice: trainClass.trainPrice,
                                                            materialPrice: trainClass.materialPrice,
                                                            discount: oldOrder.discount,
                                                            totalPrice: oldOrder.totalPrice,
                                                            realMaterialPrice: oldOrder.realMaterialPrice,
                                                            fromId: oldOrder._id,
                                                            isPayed: true,
                                                            payWay: oldOrder.payWay,
                                                            yearId: global.currentYear._id,
                                                            yearName: global.currentYear.name,
                                                            schoolId: trainClass.schoolId,
                                                            schoolArea: trainClass.schoolArea
                                                        });
                                                        adminEnrollTrain.save().then(function (newOrder) {
                                                            //cancel of old class
                                                            TrainClass.cancel(oldOrder.trainId).then(function () {
                                                                AdminEnrollTrain.changeClass(oldOrder._id).then(function () {
                                                                    res.jsonp({
                                                                        sucess: true
                                                                    });
                                                                    return;
                                                                });
                                                            });
                                                        });
                                                    });
                                                } else {
                                                    //报名失败
                                                    res.jsonp({
                                                        error: "报名失败,很可能报满"
                                                    });
                                                    return;
                                                }
                                            });
                                    });
                            } else {
                                //cannot change class
                                res.jsonp({
                                    error: "订单已经不能调班！"
                                });
                                return;
                            }
                        } else {
                            res.jsonp({
                                error: "订单的课程已取消！"
                            });
                            return;
                        }
                    });
                } else {
                    res.jsonp({
                        error: "此订单不能调班！"
                    });
                    return;
                }
            });
        });
    });

    // TBD 原班升报课程报名-查询原班
    app.post('/enroll/originalOrders', checkJSONLogin);
    app.post('/enroll/originalOrders', function (req, res) {
        EnrollProcessConfigure.get().then(function (configure) {
            if (configure && (configure.oldStudentStatus || configure.oldStudentSwitch)) {
                var currentUser = req.session.user;
                return Year.getFilter({
                        sequence: (global.currentYear.sequence - 1)
                    })
                    .then(function (year) {
                        if (year) {
                            StudentInfo.getFilters({
                                accountId: currentUser._id
                            }).then(function (students) {
                                var parray = [];
                                students.forEach(function (student) {
                                    var filter = {
                                        studentId: student._id.toJSON(),
                                        isSucceed: 1,
                                        isDeleted: {
                                            $ne: true
                                        },
                                        yearId: year._id.toJSON()
                                    };

                                    var p = AdminEnrollTrain.getFilters(filter)
                                        .then(function (trains) {
                                            var orders = [];
                                            trains.forEach(function (train) {
                                                orders.push({
                                                    orderId: train._id,
                                                    studentId: student._id,
                                                    studentName: train.studentName,
                                                    trainId: train.trainId,
                                                    trainName: train.trainName
                                                });
                                            });
                                            return orders;
                                        });
                                    parray.push(p);
                                });
                                Promise.all(parray).then(function (results) {
                                    var orders = [];
                                    results.forEach(function (trains) {
                                        if (trains) {
                                            orders = orders.concat(trains);
                                        }
                                    });
                                    res.jsonp({
                                        orders: orders,
                                        config: configure
                                    });
                                    return;
                                });
                            });
                        }
                    });
            }
            res.jsonp({
                error: "没到原班报名时间呢！"
            });
        });
    });

    //获取单个订单信息
    app.post('/enroll/getStudent', checkJSONLogin);
    app.post('/enroll/getStudent', function (req, res) {
        StudentInfo.getFilter({
                _id: req.body.studentId
            })
            .then(function (studentInfo) {
                res.jsonp(studentInfo);
            });
    });

    // TBD ....
    app.post('/enroll/getSchoolsAndOrder', checkJSONLogin);
    app.post('/enroll/getSchoolsAndOrder', function (req, res) {
        AdminEnrollTrain.get({
                _id: req.body.orderId
            })
            .then(function (order) {
                TrainClass.get(order.trainId)
                    .then(function (trainClass) {
                        var objReturn = {
                            schoolId: trainClass.schoolId,
                            subjectId: trainClass.subjectId,
                            subjectName: trainClass.subjectName,
                            studentId: order.studentId
                        };
                        var p1 = SchoolGradeRelation.getFilters({
                                gradeId: trainClass.gradeId
                            })
                            .then(function (relations) {
                                var schoolIds = relations.map(function (relation) {
                                    return relation.schoolId;
                                });
                                return SchoolArea.getFilters({
                                        _id: {
                                            $in: schoolIds
                                        }
                                    })
                                    .then(function (schools) {
                                        objReturn.schools = schools;
                                    });
                            });
                        var p2 = EnrollProcessConfigure.get()
                            .then(function (configure) {
                                var pGrade;
                                if (configure.isGradeUpgrade) {
                                    //getNextGrade
                                    pGrade = Grade.get(trainClass.gradeId)
                                        .then(function (curGrade) {
                                            return Grade.getFilter({
                                                sequence: curGrade.sequence + 1
                                            }).then(function (nextGrade) {
                                                objReturn.gradeId = nextGrade._id;
                                                objReturn.gradeName = nextGrade.name;
                                            });
                                        }); //是否升年级
                                } else {
                                    //getCurrentGrade
                                    objReturn.gradeId = trainClass.gradeId;
                                    objReturn.gradeName = trainClass.gradeName;
                                    pGrade = Promise.resolve();
                                }
                                return pGrade.then(function () {
                                    //get grade now
                                    return GradeSubjectCategoryRelation.getFilters({
                                            gradeId: objReturn.gradeId,
                                            subjectId: objReturn.subjectId
                                        })
                                        .then(function (gradeSubjectCategoryRelations) {
                                            var categoryIds = gradeSubjectCategoryRelations.map(function (relation) {
                                                    return relation.categoryId;
                                                }),
                                                curCategoryId = order.superCategoryId || trainClass.categoryId;
                                            return Category.getFilter({
                                                    _id: curCategoryId
                                                })
                                                .then(function (curCategory) {
                                                    objReturn.categoryId = curCategory._id;
                                                    objReturn.categoryName = curCategory.name;
                                                    if (curCategory.grade && curCategory.grade > 0) {
                                                        //need list
                                                        return Category.getFilters({
                                                                _id: {
                                                                    $in: categoryIds
                                                                },
                                                                grade: {
                                                                    $gt: 0,
                                                                    $lte: curCategory.grade
                                                                }
                                                            })
                                                            .then(function (categories) {
                                                                objReturn.categories = categories;
                                                            });
                                                    } else {
                                                        objReturn.categories = [{
                                                            _id: objReturn.categoryId,
                                                            name: objReturn.categoryName
                                                        }];
                                                    }
                                                });
                                        })
                                });
                            });

                        Promise.all([p1, p2]).then(function () {
                            res.jsonp(objReturn);
                        });
                    });
            });
    });

    app.post('/enroll/isOriginalClassBegin', checkJSONLogin);
    app.post('/enroll/isOriginalClassBegin', function (req, res) {
        EnrollProcessConfigure.getFilter({})
            .then(function (configure) {
                if (configure && (configure.oldStudentStatus || configure.oldStudentSwitch)) {
                    res.jsonp({
                        sucess: true
                    });
                    return;
                }
                res.jsonp({
                    error: "没到原班报名时间呢！"
                });
            });
    });
};