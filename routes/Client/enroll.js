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
    RollCallConfigure = model.rollCallConfigure,
    Year = model.year,
    ClassAttribute = model.classAttribute,
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

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

    // /showGrade/{{ score.grade }}
    // 显示级别
    app.get('/showGrade/:grade/:student', function (req, res) {
        res.render('Client/score_grade.html', {
            title: '成绩等级',
            user: req.session.user,
            grade: req.params.grade,
            student: req.params.student
        });
    });

    // 管理办法协议
    app.get('/bfbRule', checkLogin);
    app.get('/bfbRule', function (req, res) {
        res.render('Client/bfbRule.html', {
            title: '百分百学校学员缴费、退费、请假、补课管理办法'
        });
    });

    app.post('/enroll/class', function (req, res) {
        //debugger;
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var filter = {
            isWeixin: 1,
            yearId: global.currentYear._id,
            enrollCount: model.db.sequelize.literal('`enrollCount`<`totalStudentCount`')
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
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
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
            yearId: global.currentYear._id,
            enrollCount: model.db.sequelize.literal('`enrollCount`<`totalStudentCount`')
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
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
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
            yearId: global.currentYear._id,
            enrollCount: model.db.sequelize.literal('`enrollCount`<`totalStudentCount`')
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
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
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
                    isExpired: ((new Date()) > exam.enrollEndDate)
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
                                                                                    examPrice: examClass.examPrice, // 原始订单价格
                                                                                    payPrice: examClass.examPrice, // 支付订单价格
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
                                                                    _id: order._id,
                                                                    sucess: true,
                                                                    toPay: order.payPrice > 0
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

    // 新增学生信息的时候使用
    app.post('/enroll/studentsPublicSchool', checkJSONLogin);
    app.post('/enroll/studentsPublicSchool', function (req, res) {
        var filter = {
            accountId: req.session.user._id
        };
        StudentInfo.getFilters(filter)
            .then(function (students) {
                var strSql = "select S.*, G.name as gradeName from publicSchools S join publicSchoolGradeRelations R on R.publicSchoolId=S._id \
                join publicGrades G on R.publicGradeId=G._id \
                where S.isDeleted=false and R.isDeleted=false and G.isDeleted=false order by S.sequence, S.createdDate, S._id";
                model.db.sequelize.query(strSql, {
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(schools => {
                        res.jsonp({
                            students: students,
                            schools: schools
                        });
                    });
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

    app.get('/enroll/schoolgradesubjectcategoryattribute', function (req, res) {
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
                    var p7 = model.db.sequelize.query("select A._id, A.name from classAttributes A join yearAttributeRelations R \
                        on R.attributeId=A._id where R.isDeleted=false and A.isDeleted=false and R.yearId=:yearId and A.isChecked=true", {
                            replacements: {
                                yearId: global.currentYear._id
                            },
                            type: model.db.sequelize.QueryTypes.SELECT
                        })
                        .then(function (classAttributes) {
                            objReturn.classAttributes = classAttributes;
                        })
                        .catch(err => {
                            console.log('err');
                        });
                    Promise.all([p0, p1, p2, p3, p4, p5, p6, p7])
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

    function checkEnroll(studentId, trainClass, fnYes, fnNo, fnNoNeed) {
        return model.db.sequelize.query("select count(0) as count from adminEnrollTrains O join trainClasss C \
                    on O.trainId=C._id \
                    where O.yearId=:yearId and O.attributeId=:attributeId and O.studentId=:studentId and O.isDeleted=false and O.isSucceed=1 and \
                    C.courseTime=:courseTime", {
                replacements: {
                    yearId: global.currentYear._id,
                    studentId: studentId,
                    courseTime: trainClass.courseTime,
                    attributeId: trainClass.attributeId
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
                                        studentId: studentId,
                                        id: trainClass._id
                                    },
                                    type: model.db.sequelize.QueryTypes.SELECT
                                })
                                .then(function (scoreResult) {
                                    if (scoreResult && scoreResult[0] && scoreResult[0].count) {
                                        // 达到最低分数
                                        fnYes(isTimeDuplicated);
                                    } else {
                                        //没有达到最低分数要求
                                        fnNo();
                                    }
                                });
                        } else {
                            //不需要依赖考试分数
                            fnNoNeed(isTimeDuplicated);
                        }
                    });
            });
    };

    // 报名订单
    app.get('/enroll/order', checkLogin);
    app.get('/enroll/order', function (req, res) {
        // req.query.classId studentId
        TrainClass.getFilter({
                _id: req.query.classId
            })
            .then(function (trainClass) {
                checkEnroll(req.query.studentId, trainClass, function (isTimeDuplicated) {
                        res.render('Client/enroll_class_order.html', {
                            title: '课程报名',
                            trainClass: trainClass,
                            classId: req.query.classId,
                            studentId: req.query.studentId,
                            isTimeDuplicated: isTimeDuplicated
                        });
                    },
                    function () {
                        res.render('Client/enroll_class_order.html', {
                            title: '课程报名',
                            trainClass: trainClass,
                            classId: req.query.classId,
                            studentId: req.query.studentId,
                            disability: 1
                        });
                    },
                    function (isTimeDuplicated) {
                        res.render('Client/enroll_class_order.html', {
                            title: '课程报名',
                            trainClass: trainClass,
                            classId: req.query.classId,
                            studentId: req.query.studentId,
                            isTimeDuplicated: isTimeDuplicated
                        });
                    }
                );
            });
    });

    // 原班报名订单确认
    app.get('/enroll/original/order', checkLogin);
    app.get('/enroll/original/order', function (req, res) {
        //req.query.classId studentId
        TrainClass.getFilter({
                _id: req.query.classId
            })
            .then(function (trainClass) {
                AdminEnrollTrain.getFilter({
                        trainId: trainClass.fromClassId,
                        studentId: req.query.studentId,
                        isSucceed: 1
                    })
                    .then(function (order) {
                        if (order) {
                            // 有原班，可以继续报名
                            checkEnroll(req.query.studentId, trainClass, function (isTimeDuplicated) {
                                    res.render('Client/enroll_originalclass_order.html', {
                                        title: '课程报名',
                                        trainClass: trainClass,
                                        classId: req.query.classId,
                                        studentId: req.query.studentId,
                                        originalOrder: 1,
                                        isTimeDuplicated: isTimeDuplicated,
                                        orderId: req.query.orderId
                                    });
                                },
                                function () {
                                    res.render('Client/enroll_originalclass_order.html', {
                                        title: '课程报名',
                                        trainClass: trainClass,
                                        classId: req.query.classId,
                                        studentId: req.query.studentId,
                                        disability: 1,
                                        originalOrder: 1,
                                        orderId: req.query.orderId
                                    });
                                },
                                function (isTimeDuplicated) {
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
                            );
                        } else {
                            // 没有原班
                            if (req.query.orderId) {
                                // 调班报名
                                checkEnroll(req.query.studentId, trainClass, function (isTimeDuplicated) {
                                        res.render('Client/enroll_originalclass_order.html', {
                                            title: '课程报名',
                                            trainClass: trainClass,
                                            classId: req.query.classId,
                                            studentId: req.query.studentId,
                                            originalOrder: 1,
                                            isTimeDuplicated: isTimeDuplicated,
                                            orderId: req.query.orderId
                                        });
                                    },
                                    function () {
                                        res.render('Client/enroll_originalclass_order.html', {
                                            title: '课程报名',
                                            trainClass: trainClass,
                                            classId: req.query.classId,
                                            studentId: req.query.studentId,
                                            disability: minScore,
                                            originalOrder: 1,
                                            orderId: req.query.orderId
                                        });
                                    },
                                    function (isTimeDuplicated) {
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
                                );
                            } else {
                                // 不能报名
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

    function checkIsSameClassExist(trainClass, studentId) {
        var strSql = "select count(0) as count from adminEnrollTrains O join trainClasss C \
            on O.trainId = C._id where O.isDeleted=false and O.isPayed=true and O.isSucceed=1 \
            and C.yearId=:yearId and C.attributeId=:attributeId and C.categoryId=:categoryId \
            and C.subjectId=:subjectId and O.studentId=:studentId ";
        return model.db.sequelize.query(strSql, {
            replacements: {
                yearId: trainClass.yearId,
                attributeId: trainClass.attributeId,
                categoryId: trainClass.categoryId,
                subjectId: trainClass.subjectId,
                studentId: studentId
            },
            type: model.db.sequelize.QueryTypes.SELECT
        });
    };

    // 支付订单
    app.post('/enroll/pay', checkJSONLogin);
    app.post('/enroll/pay', function (req, res) {
        AdminEnrollTrain.getFilter({
                studentId: req.body.studentId,
                trainId: req.body.classId,
                isSucceed: 1
            })
            .then(function (enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({
                        error: "你已经报过名了，将跳转到订单页!"
                    });
                    return;
                }
                TrainClass.getFilter({
                        _id: req.body.classId
                    })
                    .then(function (trainClass) {
                        // 判断是否存在 同年度 同属性 同难度 同科目 的订单
                        checkIsSameClassExist(trainClass, req.body.studentId)
                            .then(function (counts) {
                                if (counts && counts.length > 0 && counts[0].count > 0) {
                                    // 不能重复报名同类课程
                                    res.jsonp({
                                        error: "你已经报过同类课程了，将跳转到订单页!"
                                    });
                                    return;
                                } else {
                                    if (trainClass.enrollCount < trainClass.totalStudentCount) {
                                        StudentInfo.getFilter({
                                                _id: req.body.studentId
                                            })
                                            .then(function (student) {
                                                var coupons = JSON.parse(req.body.couponIds),
                                                    p;
                                                if (coupons && coupons.length > 0) {
                                                    var pArray = [],
                                                        price = trainClass.trainPrice;
                                                    coupons.forEach(function (coupon) {
                                                        var pCoupon = CouponAssign.getFilter({
                                                                _id: coupon,

                                                            })
                                                            .then(function (assign) {
                                                                if (assign) {
                                                                    // 真实优惠券
                                                                    price = price - assign.reducePrice;
                                                                    // return price > 0 ? price : 0;
                                                                } else {
                                                                    // 小升初满减
                                                                    return Coupon.getFilter({
                                                                            _id: coupon
                                                                        })
                                                                        .then(function (couponObject) {
                                                                            if (couponObject) {
                                                                                price = price - couponObject.reducePrice;
                                                                                // return price > 0 ? price : 0;
                                                                            }
                                                                        });
                                                                }
                                                            });
                                                        pArray.push(pCoupon);
                                                    });
                                                    p = Promise.all(pArray)
                                                        .then(function () {
                                                            if (student.discount && student.discount != 100 && student.discount != 0) {
                                                                price = Math.round(price * student.discount) / 100;
                                                            }
                                                            return price;
                                                        });
                                                    // 根据优惠算 总的优惠金额
                                                } else {
                                                    p = Promise.resolve(trainClass.trainPrice);
                                                }
                                                p.then(function (totalPrice) {
                                                    // 1. 修改报名人数
                                                    // 2. 如果报满修改字段为满员 (may useless)
                                                    // 3. 添加新订单
                                                    model.db.sequelize.transaction(function (t1) {
                                                            return TrainClass.update({
                                                                    enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                                                }, {
                                                                    where: {
                                                                        _id: req.body.classId,
                                                                        enrollCount: model.db.sequelize.literal('`enrollCount`<`totalStudentCount`')
                                                                    },
                                                                    transaction: t1
                                                                })
                                                                .then(function (updateResult) {
                                                                    if (updateResult && updateResult[0]) {
                                                                        return AdminEnrollTrain.create({
                                                                                studentId: student._id,
                                                                                studentName: student.name,
                                                                                mobile: student.mobile,
                                                                                trainId: trainClass._id,
                                                                                trainName: trainClass.name,
                                                                                trainPrice: trainClass.trainPrice,
                                                                                materialPrice: trainClass.materialPrice,
                                                                                discount: (student.discount || 100),
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
                                                                            }, {
                                                                                transaction: t1
                                                                            })
                                                                            .then(order => {
                                                                                var coupons = JSON.parse(req.body.couponIds),
                                                                                    couponArray = [];
                                                                                if (coupons && coupons.length > 0) {
                                                                                    coupons.forEach(function (coupon) {
                                                                                        // 假定是优惠券的ID而不是分配好的优惠券
                                                                                        var p = Coupon.getFilter({
                                                                                                _id: coupon
                                                                                            })
                                                                                            .then(coupon3Min => {
                                                                                                if (coupon3Min) { // 报名3科减
                                                                                                    return CouponAssign.create({
                                                                                                        couponId: coupon3Min._id,
                                                                                                        couponName: coupon3Min.name,
                                                                                                        gradeId: coupon3Min.gradeId,
                                                                                                        gradeName: coupon3Min.gradeName,
                                                                                                        subjectId: coupon3Min.subjectId,
                                                                                                        subjectName: coupon3Min.subjectName,
                                                                                                        reducePrice: coupon3Min.reducePrice,
                                                                                                        couponStartDate: coupon3Min.couponStartDate,
                                                                                                        couponEndDate: coupon3Min.couponEndDate,
                                                                                                        studentId: req.body.studentId,
                                                                                                        studentName: student.name,
                                                                                                        isUsed: true,
                                                                                                        orderId: order._id,
                                                                                                        createdBy: req.session.user._id
                                                                                                    });
                                                                                                } else {
                                                                                                    // 分配好的优惠券, couponId 就是assignId
                                                                                                    return CouponAssign.getFilter({
                                                                                                            _id: coupon,
                                                                                                            studentId: req.body.studentId,
                                                                                                            isDeleted: false,
                                                                                                            isUsed: false
                                                                                                        })
                                                                                                        .then(function (couponAssign) {
                                                                                                            if (couponAssign) {
                                                                                                                // 优惠券就是真实未使用的
                                                                                                                return CouponAssign.update({
                                                                                                                    isUsed: true,
                                                                                                                    deletedBy: req.session.user._id,
                                                                                                                    orderId: order._id
                                                                                                                }, {
                                                                                                                    where: {
                                                                                                                        _id: couponAssign._id
                                                                                                                    },
                                                                                                                    transaction: t1
                                                                                                                });
                                                                                                            } else {
                                                                                                                // 优惠券状态更改,报名失败
                                                                                                                throw new Error("优惠券状态发生更改");
                                                                                                            }
                                                                                                        });
                                                                                                }
                                                                                            });
                                                                                        couponArray.push(p);
                                                                                    });
                                                                                    return Promise.all(couponArray)
                                                                                        .then(function () {
                                                                                            return order;
                                                                                        });
                                                                                } else {
                                                                                    return order;
                                                                                }
                                                                            });
                                                                    } else {
                                                                        return {
                                                                            error: "报名失败,很可能此课程已报满"
                                                                        };
                                                                    }
                                                                });
                                                        })
                                                        .then(function (order) {
                                                            if (order.error) {
                                                                res.jsonp(order);
                                                                return;
                                                            }

                                                            res.jsonp({
                                                                orderId: order._id
                                                            });
                                                        })
                                                        .catch(function (err) {
                                                            res.jsonp({
                                                                error: "报名失败"
                                                            });
                                                        });
                                                });
                                            });
                                    } else {
                                        res.jsonp({
                                            error: "此课程已报满"
                                        });
                                    }
                                }
                            });
                    });
            });
    });

    // 原班报名支付
    app.post('/enroll/original/pay', checkJSONLogin);
    app.post('/enroll/original/pay', function (req, res) {
        AdminEnrollTrain.getFilter({
                studentId: req.body.studentId,
                trainId: req.body.classId,
                isSucceed: 1
            })
            .then(function (enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({
                        error: "你已经报过名了，将跳转到订单页!"
                    });
                    return;
                }
                TrainClass.getFilter({
                        _id: req.body.classId
                    })
                    .then(function (trainClass) {
                        // 判断是否存在 同年度 同属性 同难度 同科目 的订单
                        checkIsSameClassExist(trainClass, req.body.studentId)
                            .then(function (counts) {
                                if (counts && counts.length > 0 && counts[0].count > 0) {
                                    // 不能重复报名同类课程
                                    res.jsonp({
                                        error: "你已经报过同类课程了，将跳转到订单页!"
                                    });
                                    return;
                                } else {
                                    StudentInfo.getFilter({
                                            _id: req.body.studentId
                                        })
                                        .then(function (student) {
                                            var coupon = req.body.coupon,
                                                price, p;
                                            if (coupon) {
                                                if (coupon == "0") {
                                                    price = Math.round(trainClass.trainPrice * student.discount) / 100;
                                                    p = Promise.resolve(price);
                                                } else {
                                                    p = CouponAssign.getFilter({
                                                            _id: coupon
                                                        })
                                                        .then(function (assign) {
                                                            if (assign) {
                                                                // 真实优惠券
                                                                price = trainClass.trainPrice - assign.reducePrice;
                                                                return price > 0 ? price : 0;
                                                            } else {
                                                                // 小升初满减
                                                                return Coupon.getFilter({
                                                                        _id: coupon
                                                                    })
                                                                    .then(function (couponObject) {
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
                                                // 1. 修改报名人数
                                                // 2. 如果报满修改字段为满员 (may useless)
                                                // 3. 添加新订单
                                                model.db.sequelize.transaction(function (t1) {
                                                        return TrainClass.update({
                                                                enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                                            }, {
                                                                where: {
                                                                    _id: req.body.classId,
                                                                    enrollCount: model.db.sequelize.literal('`enrollCount`<`totalStudentCount`')
                                                                },
                                                                transaction: t1
                                                            })
                                                            .then(function (updateResult) {
                                                                if (updateResult && updateResult[0]) {
                                                                    return AdminEnrollTrain.create({
                                                                            studentId: student._id,
                                                                            studentName: student.name,
                                                                            mobile: student.mobile,
                                                                            trainId: trainClass._id,
                                                                            trainName: trainClass.name,
                                                                            trainPrice: trainClass.trainPrice,
                                                                            materialPrice: trainClass.materialPrice,
                                                                            discount: (student.discount || 100),
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
                                                                        }, {
                                                                            transaction: t1
                                                                        })
                                                                        .then(order => {
                                                                            if (req.body.coupon && req.body.coupon != "0") {
                                                                                // 假定是优惠券的ID而不是分配好的优惠券
                                                                                return Coupon.getFilter({
                                                                                        _id: req.body.coupon
                                                                                    })
                                                                                    .then(coupon => {
                                                                                        if (coupon) { // 报名3科减
                                                                                            return CouponAssign.create({
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
                                                                                                    orderId: order._id,
                                                                                                    createdBy: req.session.user._id
                                                                                                })
                                                                                                .then(assign => {
                                                                                                    return order;
                                                                                                });
                                                                                        } else {
                                                                                            // 分配好的优惠券, couponId 就是assignId
                                                                                            return CouponAssign.getFilter({
                                                                                                    _id: req.body.coupon,
                                                                                                    studentId: req.body.studentId,
                                                                                                    isDeleted: false,
                                                                                                    isUsed: false
                                                                                                })
                                                                                                .then(function (couponAssign) {
                                                                                                    if (couponAssign) {
                                                                                                        // 优惠券就是真实未使用的
                                                                                                        return CouponAssign.update({
                                                                                                                isUsed: true,
                                                                                                                deletedBy: req.session.user._id,
                                                                                                                orderId: order._id
                                                                                                            }, {
                                                                                                                where: {
                                                                                                                    _id: couponAssign._id
                                                                                                                },
                                                                                                                transaction: t1
                                                                                                            })
                                                                                                            .then(result => {
                                                                                                                return order;
                                                                                                            });
                                                                                                    } else {
                                                                                                        // 优惠券状态更改,报名失败
                                                                                                        throw new Error("优惠券状态发生更改");
                                                                                                    }
                                                                                                });
                                                                                        }
                                                                                    });
                                                                            } else {
                                                                                return order;
                                                                            }
                                                                        });
                                                                } else {
                                                                    return {
                                                                        error: "报名失败,很可能此课程已报满"
                                                                    };
                                                                }
                                                            });
                                                    })
                                                    .then(function (order) {
                                                        if (order.error) {
                                                            res.jsonp(order);
                                                            return;
                                                        }

                                                        res.jsonp({
                                                            orderId: order._id
                                                        });
                                                    })
                                                    .catch(function (err) {
                                                        res.jsonp({
                                                            error: "报名失败"
                                                        });
                                                    });
                                            });
                                        });
                                }
                            });
                    });
            });
    });

    // 调班在报名完成后
    app.post('/enroll/changeClass', checkJSONLogin);
    app.post('/enroll/changeClass', function (req, res) {
        ChangeEnd.getFilter({})
            .then(function (changeEnd) {
                if (!changeEnd) {
                    res.jsonp({
                        error: "没有设置调班截至日期！"
                    });
                    return;
                }
                if (moment().isAfter(changeEnd.endDate)) {
                    res.jsonp({
                        error: "已经过了调班截至日期！"
                    });
                    return;
                }
                AdminEnrollTrain.getFilter({
                        isSucceed: 1,
                        isPayed: true,
                        _id: req.body.orderId,
                        yearId: global.currentYear._id
                    })
                    .then(function (oldOrder) {
                        if (oldOrder) {
                            TrainClass.getFilter({
                                    _id: oldOrder.trainId,
                                    yearId: global.currentYear._id
                                })
                                .then(function (trainClass) {
                                    if (trainClass) {
                                        //could change class
                                        //enroll of new class
                                        AdminEnrollTrain.getFilter({
                                                studentId: oldOrder.studentId,
                                                trainId: req.body.trainId,
                                                isSucceed: 1
                                            })
                                            .then(function (checkOrder) {
                                                if (checkOrder) {
                                                    res.jsonp({
                                                        error: "您已经报过新课程了!"
                                                    });
                                                    return;
                                                }
                                                TrainClass.getFilter({
                                                        _id: req.body.trainId
                                                    })
                                                    .then(function (newTrainClass) {
                                                        // 1. 修改新课报名人数
                                                        // 2. 如果报满修改字段为满员 (may useless)
                                                        // 3. 添加新订单
                                                        // 4. 修改旧课报名人数
                                                        // 5. 取消老订单
                                                        model.db.sequelize.transaction(function (t1) {
                                                                return TrainClass.update({
                                                                        enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                                                    }, {
                                                                        where: {
                                                                            _id: req.body.trainId,
                                                                            enrollCount: model.db.sequelize.literal('`enrollCount`<`totalStudentCount`')
                                                                        },
                                                                        transaction: t1
                                                                    })
                                                                    .then(function (updateResult) {
                                                                        if (updateResult && updateResult[0]) {
                                                                            return AdminEnrollTrain.create({
                                                                                    studentId: oldOrder.studentId,
                                                                                    studentName: oldOrder.studentName,
                                                                                    mobile: oldOrder.mobile,
                                                                                    trainId: newTrainClass._id,
                                                                                    trainName: newTrainClass.name,
                                                                                    attributeId: newTrainClass.attributeId,
                                                                                    attributeName: newTrainClass.attributeName,
                                                                                    trainPrice: newTrainClass.trainPrice,
                                                                                    materialPrice: newTrainClass.materialPrice,
                                                                                    discount: oldOrder.discount,
                                                                                    totalPrice: oldOrder.totalPrice,
                                                                                    realMaterialPrice: oldOrder.realMaterialPrice,
                                                                                    fromId: oldOrder._id,
                                                                                    baseId: (oldOrder.baseId || oldOrder._id),
                                                                                    isPayed: true,
                                                                                    rebatePrice: oldOrder.rebatePrice,
                                                                                    superCategoryId: oldOrder.superCategoryId,
                                                                                    superCategoryName: oldOrder.superCategoryName,
                                                                                    payWay: oldOrder.payWay,
                                                                                    yearId: global.currentYear._id,
                                                                                    yearName: global.currentYear.name,
                                                                                    schoolId: newTrainClass.schoolId,
                                                                                    schoolArea: newTrainClass.schoolArea
                                                                                }, {
                                                                                    transaction: t1
                                                                                })
                                                                                .then(order => {
                                                                                    return TrainClass.update({
                                                                                            enrollCount: model.db.sequelize.literal('`enrollCount`-1')
                                                                                        }, {
                                                                                            where: {
                                                                                                _id: oldOrder.trainId
                                                                                            },
                                                                                            transaction: t1
                                                                                        })
                                                                                        .then(function () {
                                                                                            return AdminEnrollTrain.update({
                                                                                                isSucceed: 9,
                                                                                                cancelType: 1,
                                                                                                deletedDate: new Date(),
                                                                                                deletedBy: req.session.user._id
                                                                                            }, {
                                                                                                where: {
                                                                                                    _id: oldOrder._id
                                                                                                },
                                                                                                transaction: t1
                                                                                            });
                                                                                        });
                                                                                });
                                                                        } else {
                                                                            return {
                                                                                error: "报名失败,很可能此课程已报满"
                                                                            };
                                                                        }
                                                                    });
                                                            })
                                                            .then(function (order) {
                                                                if (order.error) {
                                                                    res.jsonp(order);
                                                                    return;
                                                                }
                                                                res.jsonp({
                                                                    sucess: true
                                                                });
                                                            })
                                                            .catch(function (err) {
                                                                res.jsonp({
                                                                    error: "报名失败"
                                                                });
                                                            });
                                                    });
                                            });
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

    // 原班升报课程报名-查询原班
    app.post('/enroll/originalOrders', checkJSONLogin);
    app.post('/enroll/originalOrders', function (req, res) {
        EnrollProcessConfigure.getFilter({})
            .then(function (configure) {
                if (configure && (configure.oldStudentStatus || configure.oldStudentSwitch)) {
                    var currentUser = req.session.user;
                    return Year.getFilter({
                            sequence: (global.currentYear.sequence - 1)
                        })
                        .then(function (year) {
                            // 查找上一年度的课程订单 或者当前年度寒假订单
                            if (year) {
                                // var strSwitch = "";
                                // if (configure.oldStudentSwitch) {
                                //     strSwitch = "or (O.yearId=:curYearId and attributeName='寒假班')";
                                // }
                                return model.db.sequelize.query("select O._id as orderId, O.studentId, O.studentName, O.trainId, O.trainName\
                                            from studentInfos S join adminEnrollTrains O \
                                            on S._id=O.studentId and O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId \
                                            where S.accountId=:accountId and S.isDeleted=false", {
                                        replacements: {
                                            yearId: year._id,
                                            curYearId: global.currentYear._id,
                                            accountId: currentUser._id
                                        },
                                        type: model.db.sequelize.QueryTypes.SELECT
                                    })
                                    .then(orders => {
                                        res.jsonp({
                                            orders: orders,
                                            config: configure
                                        });
                                    });
                            } else {
                                res.jsonp({
                                    error: "没有上一年度！"
                                });
                            }
                        });
                }
                res.jsonp({
                    error: "没到原班报名时间呢！"
                });
            });
    });

    // 获取单个订单信息
    app.post('/enroll/getStudent', checkJSONLogin);
    app.post('/enroll/getStudent', function (req, res) {
        StudentInfo.getFilter({
                _id: req.body.studentId
            })
            .then(function (studentInfo) {
                res.jsonp(studentInfo);
            });
    });

    // 调班filter
    app.post('/enroll/getSchoolsAndOrder', checkJSONLogin);
    app.post('/enroll/getSchoolsAndOrder', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.body.orderId
            })
            .then(function (order) {
                TrainClass.getFilter({
                        _id: order.trainId
                    })
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
                        var p2 = EnrollProcessConfigure.getFilter({})
                            .then(function (configure) {
                                var pGrade;
                                if (configure.isGradeUpgrade) {
                                    //getNextGrade
                                    pGrade = Grade.getFilter({
                                            _id: trainClass.gradeId
                                        })
                                        .then(function (curGrade) {
                                            return Grade.getFilter({
                                                    sequence: curGrade.sequence + 1
                                                })
                                                .then(function (nextGrade) {
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
                        var p3 = model.db.sequelize.query("select A._id, A.name from classAttributes A join yearAttributeRelations R \
                                on R.attributeId=A._id where R.isDeleted=false and A.isDeleted=false and R.yearId=:yearId and A.isChecked=true", {
                                replacements: {
                                    yearId: global.currentYear._id
                                },
                                type: model.db.sequelize.QueryTypes.SELECT
                            })
                            .then(function (classAttributes) {
                                objReturn.classAttributes = classAttributes;
                            })
                            .catch(err => {
                                console.log('err');
                            });
                        Promise.all([p1, p2, p3]).then(function () {
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

    app.post('/enroll/isEnglishOrderExist', checkJSONLogin);
    app.post('/enroll/isEnglishOrderExist', function (req, res) {
        RollCallConfigure.getFilter({})
            .then(function (configure) {
                model.db.sequelize.query("select count(O._id) as count from adminEnrollTrains O join trainClasss C \
                on O.trainId=C._id join studentInfos S on O.studentId=S._id \
                where O.isSucceed=1 and O.isDeleted=false and O.yearId=:yearId and O.attributeId=:attributeId and C.isDeleted=false \
                and C.subjectName='英语' and C.isDeleted=false and S.accountId=:accountId", {
                        replacements: {
                            yearId: configure.yearId,
                            attributeId: configure.attributeId,
                            accountId: req.session.user._id
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (orders) {
                        if (orders[0] && orders[0].count > 0) {
                            res.jsonp({
                                sucess: true
                            });
                        } else {
                            res.jsonp({
                                error: "没有英语订单！"
                            });
                        }
                    });
            });
    });
};