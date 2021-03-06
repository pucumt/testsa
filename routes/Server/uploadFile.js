var xlsx = require("node-xlsx"),
    rawXLSX = require("xlsx"),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    StudentAccount = model.studentAccount,
    StudentInfo = model.studentInfo,
    ScoreFails = model.scoreFails,
    AddStudentToClassFails = model.addStudentToClassFails,
    AdminEnrollExam = model.adminEnrollExam,
    AdminEnrollTrain = model.adminEnrollTrain,
    AdminEnrollExamScore = model.adminEnrollExamScore,
    ExamClass = model.examClass,
    TrainClass = model.trainClass,
    auth = require("./auth"),
    archiver = require('archiver'),
    crypto = require('crypto'),
    Year = model.year,
    Grade = model.grade,
    Subject = model.subject,
    Category = model.category,
    ClassRoom = model.classRoom,
    SchoolArea = model.schoolArea,
    ClassAttribute = model.classAttribute,
    RebateEnrollTrain = model.rebateEnrollTrain,
    Coupon = model.coupon,
    CouponAssign = model.couponAssign,
    Teacher = model.teacher,
    OrderFromBank = model.orderFromBank,
    Lesson = model.lesson,
    LessonContent = model.lessonContent,
    Book = model.book,

    util = require('util'),
    request = require('request'),
    checkLogin = auth.checkLogin,
    serverPath = path.join(__dirname, "../"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
    upload = multer({
        storage: storage
    });

module.exports = function (app) {
    function getGradeNumber(gradeName) {
        switch (gradeName) {
            case '基础班':
                return 1;
            case '培优班':
                return 2;
            case '通中班':
                return 3;
            case '尖子班':
                return 4;
            default:
                return 0;
        }
    };

    function updateScore(scoreEntity, examId, subjectId, subjectName) {
        return StudentAccount.getFilter({
                name: scoreEntity[1]
            })
            .then(function (account) {
                if (account) {
                    return StudentInfo.getFilter({
                            accountId: account._id,
                            name: scoreEntity[0]
                        })
                        .then(function (student) {
                            if (student) {
                                return AdminEnrollExam.getFilter({
                                        examId: examId,
                                        studentId: student._id,
                                        isSucceed: 1
                                    })
                                    .then(function (order) {
                                        if (order) {
                                            // 自动批量更新
                                            if (order.payPrice > 0) {
                                                order.update({
                                                    payPrice: 0,
                                                    rebatePrice: order.payPrice
                                                });
                                            }

                                            return AdminEnrollExamScore.getFilter({
                                                    examOrderId: order._id,
                                                    subjectId: subjectId
                                                })
                                                .then(function (orgScore) {
                                                    var report = student.name + "_" + account.name + ".pdf";
                                                    if (orgScore) {
                                                        // update
                                                        return AdminEnrollExamScore.update({
                                                            score: scoreEntity[2],
                                                            grade: getGradeNumber(scoreEntity[3]),
                                                            report: report
                                                        }, {
                                                            where: {
                                                                _id: orgScore._id
                                                            }
                                                        });
                                                    } else {
                                                        // new
                                                        return AdminEnrollExamScore.create({
                                                            examOrderId: order._id,
                                                            subjectId: subjectId,
                                                            subjectName: subjectName,
                                                            score: scoreEntity[2],
                                                            grade: getGradeNumber(scoreEntity[3]),
                                                            report: report
                                                        });
                                                    }
                                                })
                                        } else {
                                            return failedScore(scoreEntity[0], scoreEntity[1], scoreEntity[2], examId, subjectId);
                                        }
                                    });
                            } else {
                                return failedScore(scoreEntity[0], scoreEntity[1], scoreEntity[2], examId, subjectId);
                            }
                        });
                } else {
                    return failedScore(scoreEntity[0], scoreEntity[1], scoreEntity[2], examId, subjectId);
                }
            });
    };

    function failedScore(name, mobile, score, examId, subject) {
        return ScoreFails.create({
            name: name, //score[0],
            mobile: mobile, //score[1],
            score: score, //score[2],
            examId: examId,
            subject: subject
        });
    };

    app.get('/admin/score', checkLogin);
    app.get('/admin/score', function (req, res) {
        res.render('Server/scoreResult.html', {
            title: '>成绩导入结果失败列表',
            user: req.session.admin
        });
    });

    app.get('/admin/score/clearAll', checkLogin);
    app.get('/admin/score/clearAll', function (req, res) {
        ScoreFails.destroy({
                where: {}
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    // 提交成绩
    app.post('/admin/score', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        Subject.getFilter({
                _id: req.body.subject
            })
            .then(function (subject) {
                var length = list[0].data.length,
                    pArray = [];
                for (var i = 1; i < length; i++) {
                    if (!list[0].data[i][0]) {
                        break;
                    }
                    pArray.push(updateScore(list[0].data[i], req.body.examId, subject._id, subject.name));
                }
                Promise.all(pArray)
                    .then(function () {
                        res.jsonp({
                            sucess: true
                        });
                    });
            });
    });

    function addBankOrder(score) {
        return OrderFromBank.getFilter({
                orderId: score[8].substr(1)
            })
            .then(function (existOrder) {
                if (!existOrder) {
                    return OrderFromBank.create({
                            createdDate: score[0].substr(1),
                            orderId: score[8].substr(1),
                            machine: score[5].substr(1), // qr or online
                            payType: score[10].substr(1), // zhifubao or weixin
                            trainPrice: score[14].substr(1)
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            });
    };

    // 提交银行数据
    app.post('/admin/uploadBank', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            pArray.push(addBankOrder(list[0].data[i]));
        }
        Promise.all(pArray)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    // 修改老班级的逻辑，稍微复杂一点
    function updateTrainClass(id, option, adminId) {
        var toCreateExams = [],
            toUpdateExams = [],
            toDeleteExamIds = [];
        if (option.exams) {
            var exams = option.exams;
            return TrainClassExam.getFilters({
                    trainClassId: id
                })
                .then(function (orgExams) {
                    exams.forEach(function (exam) {
                        var updateExam;
                        if (orgExams.some(orgExam => {
                                if (orgExam.examId == exam.examId) {
                                    orgExam.minScore = exam.minScore;
                                    updateExam = orgExam;
                                    return true;
                                }
                            })) {
                            // 更新的考试成绩
                            toUpdateExams.push(updateExam);
                        } else {
                            // 新建的考试成绩
                            exam._id = model.db.generateId();
                            exam.trainClassId = id;
                            exam.createdBy = adminId;
                            toCreateExams.push(exam);
                        }
                    });

                    orgExams.forEach(orgExam => {
                        if (!toUpdateExams.some(exam => {
                                return orgExam.examId == exam.examId;
                            })) {
                            // 删除的考场
                            toDeleteExamIds.push(orgExam._id);
                        }
                    });
                    return model.db.sequelize.transaction(function (t1) {
                        return TrainClass.update(option, {
                                where: {
                                    _id: id
                                },
                                transaction: t1
                            })
                            .then(function (resultClass) {
                                var pArray = [];
                                if (toCreateExams.length > 0) {
                                    var p = TrainClassExam.bulkCreate(toCreateExams, {
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                if (toDeleteExamIds.length > 0) {
                                    var p = TrainClassExam.update({
                                        isDeleted: true,
                                        deletedBy: adminId,
                                        deletedDate: new Date()
                                    }, {
                                        where: {
                                            _id: {
                                                $in: toDeleteExamIds
                                            }
                                        },
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                if (toUpdateExams.length > 0) {
                                    toUpdateExams.forEach(exam => {
                                        var p = exam.save({
                                            transaction: t1
                                        });
                                        pArray.push(p);
                                    });
                                }
                                return Promise.all(pArray);
                            });
                    });
                });
        } else {
            return TrainClass.update(option, {
                where: {
                    _id: id
                }
            });
        }
    };

    function getExcelDate(excelDate) {
        if (typeof (excelDate) == "string") {
            return new Date(excelDate);
        } else if (typeof (excelDate) == "number") {
            return (new Date(1900, 0, parseInt(excelDate) - 1));
        } else {
            return new Date("1900-1-1");
        }
    };

    // last column 20: yearName, 23: teacher mobile
    function createNewClass(data, adminId) {
        var option = {
            name: data[0].trim(),
            totalStudentCount: data[9],
            totalClassCount: data[8],
            trainPrice: data[10],
            materialPrice: data[11],
            courseStartDate: getExcelDate(data[5]),
            courseEndDate: getExcelDate(data[6]),
            courseTime: data[7],
            courseContent: data[18] && data[18].trim()
        };
        return Year.getFilter({
                name: data[1].trim()
            })
            .then(function (year) {
                if (year) {
                    option.yearId = year._id;
                    option.yearName = year.name;
                    return Grade.getFilter({
                            name: data[2].trim()
                        })
                        .then(function (grade) {
                            if (grade) {
                                option.gradeId = grade._id;
                                option.gradeName = grade.name;
                                return Subject.getFilter({
                                        name: data[3].trim()
                                    })
                                    .then(function (subject) {
                                        if (subject) {
                                            option.subjectId = subject._id;
                                            option.subjectName = subject.name;
                                            return Category.getFilter({
                                                    name: data[4].trim()
                                                })
                                                .then(function (category) {
                                                    if (category) {
                                                        option.categoryId = category._id;
                                                        option.categoryName = category.name;
                                                        var pAttribute;
                                                        if (data[12] && data[12].trim() != "") {
                                                            pAttribute = ClassAttribute.getFilter({
                                                                name: data[12].trim()
                                                            });
                                                        } else {
                                                            pAttribute = Promise.resolve();
                                                        }
                                                        return pAttribute.then(function (classattribute) {
                                                                if (classattribute) {
                                                                    option.attributeId = classattribute._id;
                                                                    option.attributeName = classattribute.name;
                                                                }
                                                                var pRoom;
                                                                if (data[13] && data[13].trim() != "") {
                                                                    pRoom = ClassRoom.getFilter({
                                                                        name: data[13].trim()
                                                                    });
                                                                } else {
                                                                    pRoom = Promise.resolve();
                                                                }
                                                                return pRoom.then(function (classRoom) {
                                                                        if (classRoom) {
                                                                            option.classRoomId = classRoom._id;
                                                                            option.classRoomName = classRoom.name;
                                                                        }
                                                                        var pTeacher;
                                                                        if (data[23] && data[23] != "") {
                                                                            pTeacher = Teacher.getFilter({
                                                                                mobile: data[23]
                                                                            });
                                                                        } else {
                                                                            pTeacher = Promise.resolve();
                                                                        }
                                                                        return pTeacher.then(function (teacher) {
                                                                                if (teacher) {
                                                                                    option.teacherId = teacher._id;
                                                                                    option.teacherName = teacher.name;
                                                                                }

                                                                                return SchoolArea.getFilter({
                                                                                        name: data[14].trim()
                                                                                    })
                                                                                    .then(function (school) {
                                                                                        if (school) {
                                                                                            option.schoolId = school._id;
                                                                                            option.schoolArea = school.name;

                                                                                            var pExams, examArray = [];
                                                                                            if (data[15] && data[15].trim() != "") {
                                                                                                var pExamArray = [];
                                                                                                var exams = data[15].split(",");
                                                                                                exams.forEach(function (exam) {
                                                                                                    var examScore = exam.split(":");
                                                                                                    var pExamClass = ExamClass.getFilter({
                                                                                                            name: examScore[0].trim()
                                                                                                        })
                                                                                                        .then(function (examClass) {
                                                                                                            examArray.push({
                                                                                                                examId: examClass._id,
                                                                                                                examName: examClass.name,
                                                                                                                minScore: examScore[1].trim()
                                                                                                            });
                                                                                                        });
                                                                                                    pExamArray.push(pExamClass);
                                                                                                });
                                                                                                pExams = Promise.all(pExamArray);
                                                                                            } else {
                                                                                                pExams = Promise.all([]);
                                                                                            }
                                                                                            return pExams.then(function () {
                                                                                                if (examArray.length > 0) {
                                                                                                    option.exams = examArray;
                                                                                                }
                                                                                                var pTrainClass;
                                                                                                if (data[16] && data[16].trim() != "") {
                                                                                                    pTrainClass = TrainClass.getFilter({
                                                                                                        name: data[16].trim(),
                                                                                                        schoolArea: data[19].trim(),
                                                                                                        yearName: data[20].trim()
                                                                                                    });
                                                                                                } else {
                                                                                                    pTrainClass = Promise.resolve();
                                                                                                }
                                                                                                return pTrainClass.then(function (trainClass) {
                                                                                                    if (trainClass) {
                                                                                                        option.fromClassId = trainClass._id;
                                                                                                        option.fromClassName = trainClass.name;
                                                                                                        option.isWeixin = 2;
                                                                                                    } else if (data[16] && data[16].trim() != "") {
                                                                                                        return failedAddStudentToClass("", "", data[0].trim(), "没找到原班");
                                                                                                    }
                                                                                                    // if (data[17] && data[17] != "") { //日期类型的处理比较麻烦，保护期没有用上
                                                                                                    //     option.protectedDate = (new Date(1900, 0, parseInt(data[17]) - 1));
                                                                                                    // }
                                                                                                    return TrainClass.getFilter({
                                                                                                            name: data[0].trim(),
                                                                                                            schoolArea: data[14].trim(),
                                                                                                            yearName: data[1].trim()
                                                                                                        })
                                                                                                        .then(function (existTrainClass) {
                                                                                                            if (existTrainClass) {
                                                                                                                // update 
                                                                                                                delete option.isWeixin;
                                                                                                                return updateTrainClass(existTrainClass._id, option, adminId);
                                                                                                            } else { // create
                                                                                                                option.createdBy = adminId;
                                                                                                                return TrainClass.create(option);
                                                                                                            }
                                                                                                        });

                                                                                                });
                                                                                            });
                                                                                        } else {
                                                                                            return failedAddStudentToClass("", "", data[0].trim(), "没找到校区");
                                                                                        }
                                                                                    })
                                                                                    .catch(function () {
                                                                                        return failedAddStudentToClass("", "", data[0].trim(), "没找到校区");
                                                                                    });
                                                                            })
                                                                            .catch(function () {
                                                                                return failedAddStudentToClass("", "", data[0].trim(), "没找到老师");
                                                                            });
                                                                    })
                                                                    .catch(function () {
                                                                        return failedAddStudentToClass("", "", data[0].trim(), "没找到教室");
                                                                    });
                                                            })
                                                            .catch(function () {
                                                                return failedAddStudentToClass("", "", data[0].trim(), "没找到属性");
                                                            });
                                                    } else {
                                                        return failedAddStudentToClass("", "", data[0].trim(), "没找到难度");
                                                    }
                                                })
                                                .catch(function () {
                                                    return failedAddStudentToClass("", "", data[0].trim(), "没找到难度");
                                                });
                                        } else {
                                            return failedAddStudentToClass("", "", data[0].trim(), "没找到科目");
                                        }
                                    })
                                    .catch(function () {
                                        return failedAddStudentToClass("", "", data[0].trim(), "没找到科目");
                                    });
                            } else {
                                return failedAddStudentToClass("", "", data[0].trim(), "没找到年级");
                            }
                        })
                        .catch(function () {
                            return failedAddStudentToClass("", "", data[0].trim(), "没找到年级");
                        });
                } else {
                    return failedAddStudentToClass("", "", data[0].trim(), "没找到年度");
                }
            })
            .catch(function () {
                return failedAddStudentToClass("", "", data[0].trim(), "没找到年度");
            });


    };

    // 批量创建/修改班级信息
    app.post('/admin/batchTrainClass', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        var pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            pArray.push(createNewClass(list[0].data[i]), req.session.admin._id);
        }
        Promise.all(pArray)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.get('/admin/batchAddStudentToTrainClassResult', checkLogin);
    app.get('/admin/batchAddStudentToTrainClassResult', function (req, res) {
        res.render('Server/batchAddStudentToTrainClassResult.html', {
            title: '>老生班级导入结果失败列表',
            user: req.session.admin
        });
    });
    app.get('/admin/batchAddStudentToTrainClass/clearAll', checkLogin);
    app.get('/admin/batchAddStudentToTrainClass/clearAll', function (req, res) {
        AddStudentToClassFails.destroy({
                where: {}
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });
    app.get('/admin/batchAddStudentToTrainClass/all', checkLogin);
    app.get('/admin/batchAddStudentToTrainClass/all', function (req, res) {
        AddStudentToClassFails.getFilters({})
            .then(function (allFails) {
                res.jsonp(allFails);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    function failedAddStudentToClass(name, mobile, className, reason) {
        return AddStudentToClassFails.create({
            name: name, //score[0],
            mobile: mobile, //score[1],
            className: className,
            reason: reason
        });
    };

    function addStudentToClass(data) {
        var option = {
            isPayed: true
        };
        return TrainClass.getFilter({
                name: data[0].trim(),
                schoolArea: data[3].trim(),
                yearName: data[8].trim()
            })
            .then(function (existTrainClass) {
                if (existTrainClass) {
                    option.trainId = existTrainClass._id;
                    option.trainName = existTrainClass.name;
                    option.yearId = existTrainClass.yearId;
                    option.yearName = existTrainClass.yearName;
                    option.schoolId = existTrainClass.schoolId;
                    option.schoolArea = existTrainClass.schoolArea;
                    return StudentInfo.getFilter({
                            name: data[1].trim(),
                            mobile: data[2]
                        })
                        .then(function (student) {
                            if (student) {
                                option.studentId = student._id;
                                option.studentName = student.name;
                                return AdminEnrollTrain.getFilter({
                                        trainId: existTrainClass._id,
                                        studentId: student._id,
                                        isSucceed: 1
                                    })
                                    .then(function (order) {
                                        if (!order) {
                                            return AdminEnrollTrain.create(option);
                                        }
                                    });
                            } else {
                                return Grade.getFilter({
                                        name: data[5] && data[5].trim()
                                    })
                                    .then(function (grade) {
                                        if (grade) {
                                            return StudentAccount.getFilter({
                                                    name: data[2]
                                                })
                                                .then(function (account) {
                                                    var pStudent;
                                                    if (account) {
                                                        pStudent = Promise.resolve(account);
                                                    } else {
                                                        var md5 = crypto.createHash('md5');
                                                        pStudent = StudentAccount.create({
                                                            name: data[2],
                                                            password: password = md5.update("111111").digest('hex')
                                                        });
                                                    }
                                                    return pStudent.then(function (account) {
                                                        if (account) {
                                                            return StudentInfo.create({
                                                                    name: data[1].trim(),
                                                                    sex: (data[7] && data[7].trim() == "男" ? false : true),
                                                                    accountId: account._id,
                                                                    mobile: data[2],
                                                                    gradeId: grade._id,
                                                                    gradeName: grade.name,
                                                                    School: data[4] && data[4].trim(),
                                                                    className: data[6]
                                                                })
                                                                .then(function (student) {
                                                                    if (student) {
                                                                        option.studentId = student._id;
                                                                        option.studentName = student.name;
                                                                        return AdminEnrollTrain.getFilter({
                                                                                trainId: existTrainClass._id,
                                                                                studentId: student._id,
                                                                                isSucceed: 1
                                                                            })
                                                                            .then(function (order) {
                                                                                if (!order) {
                                                                                    return AdminEnrollTrain.create(option);
                                                                                }
                                                                            });
                                                                    } else {
                                                                        return failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "新增学生出错");
                                                                    }
                                                                });
                                                        } else {
                                                            return failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "添加账号出错");
                                                        }
                                                    });
                                                });
                                        } else {
                                            return failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "没找到年级");
                                        }
                                    });
                            }
                        });
                } else {
                    return failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "没找到班级");
                }
            });
    };

    // 添加学生订单的时候，有可能学生是新增的，这个时候需要同步执行才不至于产生重复的数据
    app.post('/admin/batchAddStudentToTrainClass', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        var promiseAdd = function (i) {
            if (i >= length || !list[0].data[i][0]) {
                res.jsonp({
                    sucess: true
                });
                return;
            }
            addStudentToClass(list[0].data[i])
                .then(function () {
                    promiseAdd(i + 1);
                });
        };
        promiseAdd(1);
    });

    app.get('/admin/score/getAllWithoutPage', checkLogin);
    app.get('/admin/score/getAllWithoutPage', function (req, res) {
        ScoreFails.getFilters({})
            .then(function (scoreFails) {
                res.jsonp(scoreFails);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.post('/admin/export/scoreTemplate', function (req, res) {
        var data = [
            ['姓名', '联系方式', '成绩', '等级']
        ];
        var p = AdminEnrollExam.getFilters({
                examId: req.body.examId,
                isSucceed: 1
            })
            .then(function (orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function (order) {
                        var Px = StudentInfo.getFilter({
                                _id: order.studentId
                            })
                            .then(function (student) {
                                if (student && student.accountId) {
                                    return StudentAccount.getFilter({
                                            _id: student.accountId
                                        })
                                        .then(function (account) {
                                            data.push([student.name, account.name]);
                                        });
                                } else {
                                    data.push([order.studentId, order._id]);
                                }
                            });
                        PArray.push(Px);
                    });
                    return Promise.all(PArray);
                }
            });

        p.then(function () {
            var buffer = xlsx.build([{
                    name: "成绩",
                    data: data
                }]),
                fileName = req.body.exam.substr(0, 19) + '_' + req.body.subject + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({
                sucess: true
            });
            // res.redirect('/admin/export/scoreTemplate?name=' + encodeURI(fileName));
        });
    });

    app.post('/admin/export/scoreSchoolTemplate', function (req, res) {
        var data = [
            ['姓名', '联系方式', '考场', '学校', '班级', '成绩', '等级']
        ];
        var p = AdminEnrollExam.getFilters({
                examId: req.body.examId,
                isSucceed: 1
            })
            .then(function (orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function (order) {
                        var Px = StudentInfo.getFilter({
                                _id: order.studentId
                            })
                            .then(function (student) {
                                if (student && student.accountId) {
                                    return StudentAccount.getFilter({
                                            _id: student.accountId
                                        })
                                        .then(function (account) {
                                            data.push([student.name, account.name, order.examAreaName, student.School, student.className]);
                                        });
                                } else {
                                    data.push([order.studentId, order._id]);
                                }
                            });
                        PArray.push(Px);
                    });
                    return Promise.all(PArray);
                }
            });

        p.then(function () {
            var buffer = xlsx.build([{
                    name: "成绩",
                    data: data
                }]),
                fileName = req.body.exam.substr(0, 19) + '_' + req.body.subject + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({
                sucess: true
            });
            // res.redirect('/admin/export/scoreTemplate?name=' + encodeURI(fileName));
        });
    });

    app.get('/admin/export/scoreTemplate', checkLogin);
    app.get('/admin/export/scoreTemplate', function (req, res) {
        res.render('Server/scoreTemplate.html', {
            title: '>成绩模板导出',
            user: req.session.admin,
            name: decodeURI(req.query.name)
        });
    });

    function deleteFilesInFolder(path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse  
                    deleteFilesInFolder(curPath);
                } else { // delete file  
                    fs.unlinkSync(curPath);
                }
            });
        }
    };

    // TBD the logic should be changed to single report // or just remove?
    app.post('/admin/export/reportTemplate', function (req, res) {
        res.jsonp({
            sucess: true
        });
        // var outputPath = path.join(serverPath, "../public/downloads/", req.body.examId + ".zip");
        // if (fs.existsSync(outputPath)) {
        //     fs.unlinkSync(outputPath);
        // }
        // var disPath = path.join(serverPath, "../public/downloads/", req.body.examId);
        // deleteFilesInFolder(disPath);
        // var src = path.join(serverPath, "../public/downloads/reportTemplate_" + req.body.subject + ".doc");
        // var copyFile = function () {
        //     var p = AdminEnrollExam.getFilters({
        //             examId: req.body.examId,
        //             isSucceed: 1
        //         })
        //         .then(function (orders) {
        //             if (orders.length > 0) {
        //                 var PArray = [];
        //                 orders.forEach(function (order) {
        //                     var Px = StudentInfo.get(order.studentId).then(function (student) {
        //                         if (student) {
        //                             return StudentAccount.get(student.accountId).then(function (account) {
        //                                 var fileName = student.name + '_' + account.name + '_' + req.body.subject + '_' + req.body.exam.substr(0, 19) + '.doc';
        //                                 fs.createReadStream(src).pipe(fs.createWriteStream(path.join(disPath, fileName)));
        //                             });
        //                         }
        //                     });
        //                     PArray.push(Px);
        //                 });
        //                 return Promise.all(PArray);
        //             }
        //         });
        //     p.then(function () {
        //         var output = fs.createWriteStream(outputPath);
        //         archive = archiver('zip', {
        //             store: true // Sets the compression method to STORE. 
        //         });
        //         archive.pipe(output);
        //         archive.directory(disPath, "");
        //         archive.finalize();
        //         res.jsonp({
        //             sucess: true
        //         });
        //     }).catch(function (error) {
        //         res.jsonp({
        //             error: error
        //         });
        //     });
        // };
        // fs.exists(disPath, function (exists) {
        //     // 已存在
        //     if (exists) {
        //         copyFile();
        //     }
        //     // 不存在
        //     else {
        //         fs.mkdir(disPath, function () {
        //             copyFile();
        //         });
        //     }
        // });
    });

    app.post('/admin/export/classTemplate3', function (req, res) {
        var data = [
            ['姓名', '联系方式', '科目', '时间', '校区', '培训费', '教材费', '科目', '时间', '校区', '培训费', '教材费', '科目', '时间', '校区', '培训费', '教材费']
        ];
        var p = AdminEnrollExam.getFilters({
                examId: req.body.examId,
                isSucceed: 1
            })
            .then(function (orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function (order) {
                        var Px = StudentInfo.getFilter({
                                _id: order.studentId
                            })
                            .then(function (student) {
                                if (student) {
                                    var p2Array = [],
                                        singleInfo = [student.name, student.mobile, '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
                                    return AdminEnrollTrain.getFilters({
                                        studentId: student._id,
                                        isSucceed: 1,
                                        yearId: global.currentYear._id
                                    }).then(function (classOrders) {
                                        if (classOrders && classOrders.length > 0) {
                                            classOrders.forEach(function (newOrder) {
                                                var pClass = TrainClass.getFilter({
                                                        _id: newOrder.trainId
                                                    })
                                                    .then(function (newClass) {
                                                        switch (newClass.subjectName) {
                                                            case "语文":
                                                                singleInfo[2] = "语文";
                                                                singleInfo[3] = newClass.courseTime;
                                                                singleInfo[4] = newClass.schoolArea;
                                                                singleInfo[5] = newOrder.totalPrice;
                                                                singleInfo[6] = newOrder.realMaterialPrice;
                                                                break;
                                                            case "数学":
                                                                singleInfo[7] = "数学";
                                                                singleInfo[8] = newClass.courseTime;
                                                                singleInfo[9] = newClass.schoolArea;
                                                                singleInfo[10] = newOrder.totalPrice;
                                                                singleInfo[11] = newOrder.realMaterialPrice;
                                                                break;
                                                            case "英语":
                                                                singleInfo[12] = "英语";
                                                                singleInfo[13] = newClass.courseTime;
                                                                singleInfo[14] = newClass.schoolArea;
                                                                singleInfo[15] = newOrder.totalPrice;
                                                                singleInfo[16] = newOrder.realMaterialPrice;
                                                                break;
                                                        }
                                                        // singleInfo.push(newClass.subjectName);
                                                    });
                                                p2Array.push(pClass);
                                            });
                                            return Promise.all(p2Array);
                                        } else {
                                            return Promise.all([]);
                                        }
                                    }).then(function () {
                                        data.push(singleInfo);
                                    });
                                } else {
                                    data.push([order.studentId, order._id]);
                                }
                            });
                        PArray.push(Px);
                    });
                    return Promise.all(PArray);
                }
            });
        p.then(function () {
            var buffer = xlsx.build([{
                    name: "报名情况",
                    data: data
                }]),
                fileName = '报名情况3' + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({
                sucess: true
            });
        });
    });

    function getPayway(way) {
        switch (way) {
            case 0:
                return "现金";
            case 1:
                return "刷卡";
            case 2:
                return "转账";
            case 8:
                return "支付宝";
            case 9:
                return "微信";
            case 6:
                return "在线";
            case 7:
                return "在线";
        }
        return "";
    };

    function getOrderPayway(order) {
        if (order.fromId) {
            return AdminEnrollTrain.getFilter({
                    _id: order.fromId
                })
                .then(function (oldOrder) {
                    return getOrderPayway(oldOrder);
                });
        } else {
            return Promise.resolve(getPayway(order.payWay));
        }
    };

    // 导出所有报名订单
    app.post('/admin/export/classTemplate5', function (req, res) {
        var data = [
            ['姓名', '联系方式', '学生学校', '学生班级', '性别', '报名日期', '科目', '校区', '课程', '上课时间', '年级', '培训费', '教材费', '退费', '支付方式', '备注', '属性']
        ];

        var p = model.db.sequelize.query("select O.studentName, S.mobile, S.School, S.className, S.sex, DATE_ADD(O.createdDate,INTERVAL 8 HOUR) as createdDate,\
        C.subjectName, C.schoolArea, C.name, C.courseTime, C.gradeName, O.totalPrice, O.realMaterialPrice, O.rebatePrice, O.payWay, O.comment, C.attributeName \
        from adminEnrollTrains O \
        join studentInfos S on O.studentId=S._id \
        join trainClasss C on O.trainId=C._id \
        where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId", {
                replacements: {
                    yearId: global.currentYear._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(orders => {
                if (orders && orders.length > 0) {
                    orders.forEach(function (order) {
                        var singleInfo = [order.studentName, order.mobile, order.School, order.className, (order.sex ? "女" : "男"), order.createdDate, order.subjectName, order.schoolArea, order.name, order.courseTime, order.gradeName, parseFloat(order.totalPrice), parseFloat(order.realMaterialPrice), parseFloat(order.rebatePrice), getPayway(order.payWay), order.comment, order.attributeName];
                        data.push(singleInfo);
                    });
                }

                var buffer = xlsx.build([{
                        name: "报名情况",
                        data: data
                    }]),
                    fileName = '报名情况5' + '.xlsx';
                fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
                res.jsonp({
                    sucess: true
                });
            });
    });

    // 导出所有课程情况
    app.post('/admin/export/classTemplate6', function (req, res) {
        var data = [
            ['课程', '科目', '校区', '年级', '时间', '已报', '总数']
        ];
        return TrainClass.getFilters({
                yearId: global.currentYear._id
            })
            .then(function (newClasses) {
                if (newClasses.length > 0) {
                    newClasses.forEach(function (newClass) {
                        var singleInfo = [newClass.name, newClass.subjectName, newClass.schoolArea, newClass.gradeName, newClass.courseTime, newClass.enrollCount, newClass.totalStudentCount];
                        data.push(singleInfo);
                    });

                    var buffer = xlsx.build([{
                            name: "报名情况",
                            data: data
                        }]),
                        fileName = '报名情况6' + '.xlsx';
                    fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
                    res.jsonp({
                        sucess: true
                    });
                }
            });
    });

    // 给订单添加年度
    app.post('/admin/adminEnrollTrain/addYearToOrder', checkLogin);
    app.post('/admin/adminEnrollTrain/addYearToOrder', function (req, res) {
        AdminEnrollTrain.getFilters({
                yearId: null
            })
            .then(function (orders) {
                if (orders && orders.length > 0) {
                    var pArray = [];
                    orders.forEach(function (order) {
                        var p = TrainClass.get(order.trainId)
                            .then(function (trainClass) {
                                if (trainClass) {
                                    return AdminEnrollTrain.update({
                                        yearId: trainClass.yearId,
                                        yearName: trainClass.yearName
                                    }, {
                                        where: {
                                            _id: order._id
                                        }
                                    });
                                } else {
                                    failedAddStudentToClass(order.trainId, "", "", "没找到课程");
                                }
                            });
                        pArray.push(p);
                    });
                    Promise.all(pArray)
                        .then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        });
                } else {
                    res.jsonp({
                        error: "没找到任何订单"
                    });
                }
            });
    });

    // 给订单添加校区
    app.post('/admin/adminEnrollTrain/addSchoolToOrder', checkLogin);
    app.post('/admin/adminEnrollTrain/addSchoolToOrder', function (req, res) {
        AdminEnrollTrain.getFilters({})
            .then(function (orders) {
                if (orders && orders.length > 0) {
                    var pArray = [];
                    orders.forEach(function (order) {
                        var p = TrainClass.get(order.trainId)
                            .then(function (trainClass) {
                                if (trainClass) {
                                    //updateyear also could update other attributes
                                    return AdminEnrollTrain.update({
                                        schoolId: trainClass.schoolId,
                                        schoolArea: trainClass.schoolArea
                                    }, {
                                        where: {
                                            _id: order._id
                                        }
                                    });
                                } else {
                                    failedAddStudentToClass(order.trainId, "", "", "没找到课程");
                                }
                            });
                        pArray.push(p);
                    });
                    Promise.all(pArray)
                        .then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        });
                } else {
                    res.jsonp({
                        error: "没找到任何订单"
                    });
                }
            });
    });

    // 3门报名情况 主要用于小升初 TBD
    app.post('/admin/export/gradeMOneList', function (req, res) {
        res.jsonp({
            sucess: true
        });

        //     var data = [
        //         ['学生', '电话', '课程', '培训费', '教材费', '课程', '培训费', '教材费', '课程', '培训费', '教材费']
        //     ];
        //     return AdminEnrollTrain.getFilters({
        //             yearId: global.currentYear._id,
        //             gradeId: req.body.gradeId
        //         })
        //         .then(function (people) {
        //             var pArray = [];
        //             people.forEach(function (person) {
        //                 var p = StudentInfo.getFilter({
        //                         _id: person._id.studentId
        //                     })
        //                     .then(function (student) {
        //                         var singleInfo
        //                         if (student) {
        //                             singleInfo = [student.name, student.mobile];
        //                         } else {
        //                             singleInfo = [person._id.studentId, ""];
        //                         }
        //                         data.push(singleInfo);
        //                         return AdminEnrollTrain.getFilters({
        //                             studentId: person._id.studentId,
        //                             yearId: global.currentYear._id,
        //                             isSucceed: 1
        //                         }).then(function (orders) {
        //                             orders.forEach(function (order) {
        //                                 singleInfo.push(order.trainName);
        //                                 singleInfo.push(order.totalPrice);
        //                                 singleInfo.push(order.realMaterialPrice);
        //                             })
        //                         });
        //                     });
        //                 pArray.push(p);
        //             });
        //             Promise.all(pArray).then(function () {
        //                 var buffer = xlsx.build([{
        //                         name: "报名情况",
        //                         data: data
        //                     }]),
        //                     fileName = '小升初3门报名情况' + '.xlsx';
        //                 fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
        //                 res.jsonp({
        //                     sucess: true
        //                 });
        //             });
        //         });
        // 
    });

    // 退费报表
    app.post('/admin/export/rebateAllList', function (req, res) {
        var data = [
            ['学生', '电话', '订单', '课程', '校区', '年级', '科目', '退费', '退费日期', '退费方式']
        ];
        var p = model.db.sequelize.query("select S.name as studentName, S.mobile, O._id, C.name, C.schoolArea, C.gradeName, C.subjectName, \
        R.rebateTotalPrice, DATE_ADD(R.createdDate,INTERVAL 8 HOUR) as createdDate, R.rebateWay from rebateEnrollTrains R join adminEnrollTrains O \
        on O._id=R.trainOrderId \
        join studentInfos S on O.studentId=S._id \
        join trainClasss C on O.trainId=C._id \
        where R.isDeleted=false and O.yearId=:yearId", {
                replacements: {
                    yearId: global.currentYear._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(orders => {
                if (orders && orders.length > 0) {
                    orders.forEach(function (order) {
                        var singleInfo = [order.studentName, order.mobile, order._id, order.name, order.schoolArea, order.gradeName, order.subjectName, order.rebateTotalPrice, order.createdDate, getPayway(order.rebateWay)];
                        data.push(singleInfo);
                    });
                }

                var buffer = xlsx.build([{
                        name: "退费情况",
                        data: data
                    }]),
                    fileName = '全部退费列表' + '.xlsx';
                fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
                res.jsonp({
                    sucess: true
                });
            });
    });

    // 已经支付，但被系统误认为取消的订单
    app.post('/admin/export/otherOrder1', function (req, res) {
        var data = [
            ['学生', '电话', '订单', '订单日期', '课程', '校区', '年级', '科目', '退费']
        ];
        AdminEnrollTrain.getFilters({
                isSucceed: 9,
                isPayed: true,
                fromId: '',
                payWay: 6,
                deletedBy: 'system'
            })
            .then(function (orders) {
                var pArray = [];
                orders.forEach(function (order) {
                    var p = AdminEnrollTrain.getFilter({
                            fromId: order._id
                        })
                        .then(function (changeOrder) {
                            if (!changeOrder) {
                                return TrainClass.getFilter({
                                        _id: order.trainId
                                    })
                                    .then(function (originalClass) {
                                        var singleInfo = [order.studentName, order.mobile, order._id, order.createdDate, order.trainName, originalClass.schoolArea, originalClass.gradeName, originalClass.subjectName, order.rebatePrice];
                                        data.push(singleInfo);
                                    });
                            }
                        });
                    pArray.push(p);
                });
                Promise.all(pArray)
                    .then(function () {
                        var buffer = xlsx.build([{
                                name: "订单情况",
                                data: data
                            }]),
                            fileName = '已支付被取消订单' + '.xlsx';
                        fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
                        res.jsonp({
                            sucess: true
                        });
                    });
            });
    });

    // rawXLSX 点名列表
    app.post('/admin/export/rollCallList', function (req, res) {
        // var workbook = rawXLSX.readFile(path.join(serverPath, "../public/downloads/", 'test.xlsx'));
        // var first_sheet_name = workbook.SheetNames[0];
        // /* Get worksheet */
        // var worksheet = workbook.Sheets[first_sheet_name];
        // var new_ws_name = "SheetJS";

        // /* make worksheet */
        // var ws_data = [
        //     ["S", "h", "e", "e", "t", "J", "S"],
        //     [1, 2, 3, 4, 5]
        // ];
        // var ws = rawXLSX.utils.aoa_to_sheet(ws_data);

        // /* Add the sheet name to the list */
        // workbook.SheetNames.push(new_ws_name);

        // /* Load the worksheet object */
        // workbook.Sheets[new_ws_name] = ws;

        // rawXLSX.writeFile(workbook, 'out.xlsx');
    });

    function checkstudent(score) {
        return StudentInfo.getFilter({
                name: score[0]
            })
            .then(function (student) {
                if (student) {
                    if (student.mobile != score[1]) {
                        return failedScore(score[0], score[1], student.mobile, '该学生号码不匹配');
                    }
                } else {
                    return failedScore(score[0], score[1], '', '没找到该学生');
                }
            });
    };

    // check is the student is exist in db
    // 跟系统学生进行匹配
    app.post('/admin/checkstudent', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            pArray.push(checkstudent(list[0].data[i]));
        }
        // res.redirect('/admin/score');
        Promise.all(pArray)
            .then(function () {
                res.jsonp({});
            });
    });

    function couponAssignStudent(score, couponId, admin) {
        return StudentInfo.getFilter({
                name: score[0],
                mobile: score[1]
            })
            .then(function (student) {
                if (student) {
                    return Coupon.getFilter({
                            _id: couponId
                        })
                        .then(function (coupon) {
                            return CouponAssign.getFilter({
                                    couponId: coupon._id,
                                    studentId: student._id
                                })
                                .then(function (couponAssign) {
                                    if (!couponAssign) {
                                        //assign student with coupon
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
                                            studentId: student._id,
                                            studentName: student.name,
                                            createdBy: admin._id
                                        });
                                    }
                                });
                        });
                } else {
                    //create new student and assign with coupon
                    return failedScore(score[0], score[1], '', '没找到该学生');
                }
            });
    };

    // if student in db, assign it. it not, created and assign
    // 批量给系统学生分配优惠券
    app.post('/admin/coupon/batchAssign', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]

        var length = list[0].data.length,
            pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(couponAssignStudent(list[0].data[i], req.body.couponId, req.session.admin));
        }

        // res.redirect('/admin/score');
        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    function couponDeleteStudent(score, couponId) {
        return StudentInfo.getFilter({
                name: score[0],
                mobile: score[1]
            })
            .then(function (student) {
                if (student) {
                    return Coupon.getFilter({
                            _id: couponId
                        })
                        .then(function (coupon) {
                            if (coupon) {
                                //remove coupon from student
                                return CouponAssign.update({
                                    isDeleted: true
                                }, {
                                    where: {
                                        couponId: coupon._id,
                                        studentId: student._id
                                    }
                                });
                            } else {
                                //create new student and assign with coupon
                                return failedScore(score[0], score[1], '', '没找到该优惠券');
                            }
                        });
                } else {
                    //create new student and assign with coupon
                    return failedScore(score[0], score[1], '', '没找到该学生');
                }
            });
    };

    // if student in db, assign it. it not, created and assign
    // 批量删除学生的优惠券
    app.post('/admin/coupon/batchDelete', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]

        var length = list[0].data.length,
            pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(couponDeleteStudent(list[0].data[i], req.body.couponId));
        }

        // res.redirect('/admin/score');
        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    //  failedScore(score[0], score[1], score[2], examId, subject);
    function addClassRoom(score) {
        return SchoolArea.getFilter({
                name: score[2].trim()
            })
            .then(function (school) {
                if (school) {
                    return ClassRoom.getFilter({
                            name: score[0],
                            schoolId: school._id
                        })
                        .then(function (classRoom) {
                            if (!classRoom) {
                                return ClassRoom.create({
                                    name: score[0],
                                    sCount: score[1],
                                    schoolId: school._id,
                                    schoolArea: school.name
                                });
                            }
                        });
                } else {
                    return failedScore(score[0], score[1], score[2], "没找到校区");
                }
            });
    };

    // 批量添加教室
    app.post('/admin/batchAddClassRoom', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(addClassRoom(list[0].data[i]));
        }

        // res.redirect('/admin/score');
        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    //  failedScore(score[0], score[1], score[2], examId, subject);
    function addTeacher(score) {
        return Teacher.getFilter({
                name: score[0].trim(),
                mobile: score[2]
            })
            .then(function (teacher) {
                if (!teacher) {
                    var md5 = crypto.createHash('md5');
                    return Teacher.create({
                        name: score[0].trim(),
                        mobile: score[2],
                        engName: score[1] && score[1].trim(),
                        password: md5.update("111111").digest('hex')
                    });
                }
            });
    };

    // 批量添加老师
    app.post('/admin/batchAddTeacher', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(addTeacher(list[0].data[i]));
        }

        // res.redirect('/admin/score');
        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    function addTeacherClassRoomToClass(data) {
        var option = {};
        return TrainClass.getFilter({
            name: data[0].trim(),
            schoolArea: data[2].trim(),
            yearName: data[8].trim()
        }).then(function (existTrainClass) {
            if (existTrainClass) {
                var pRoom;
                if (data[9] && data[9].trim() != "") { //9 is classroom
                    pRoom = ClassRoom.getFilter({
                        name: data[9].trim(),
                        schoolArea: data[2].trim()
                    });
                } else {
                    pRoom = Promise.resolve();
                }
                return pRoom.then(function (classRoom) {
                    if (classRoom) {
                        option.classRoomId = classRoom._id;
                        option.classRoomName = classRoom.name;
                    }

                    var pTeacher;
                    if (data[6]) { //6 is mobile, because the the mobile is unique
                        pTeacher = Teacher.getFilter({
                            mobile: data[6]
                        });
                    } else {
                        pTeacher = Promise.resolve();
                    }
                    return pTeacher.then(function (teacher) {
                        if (teacher) {
                            option.teacherId = teacher._id;
                            option.teacherName = teacher.name;
                            // 批量添加课文
                            var pBook;
                            if (data[10] && data[10].trim() != "") { // 10 is book name
                                pBook = Book.getFilter({
                                    name: data[10].trim()
                                });
                            } else {
                                pBook = Promise.resolve();
                            }
                            return pBook.then(function (book) {
                                if (book) {
                                    option.bookId = book._id;
                                    option.minLesson = data[11];
                                    option.maxLesson = data[12];
                                }
                                return TrainClass.update(option, {
                                    where: {
                                        _id: existTrainClass._id
                                    }
                                });
                            });
                        } else {
                            return failedScore(data[0].trim(), data[2].trim(), data[8].trim(), "没找到老师");
                        }
                    });
                });
            } else {
                return failedScore(data[0].trim(), data[2].trim(), data[8].trim(), "没找到课程");
            }
        });
    };

    // 批量添加 “老师/教室/课文” 到课程
    app.post('/admin/batchAddTeacherToTrainClass', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        var pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            pArray.push(addTeacherClassRoomToClass(list[0].data[i]));
        }
        Promise.all(pArray)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    function getTextByContentType(contentType, number) {
        switch (contentType) {
            case "0":
                return "课文";
            case "1":
                return util.format("第%d个单词", number);
            case "2":
                return util.format("第%d个句子", number);
        }
    };

    function validateFolder(folder) {
        if (!fs.existsSync(folder)) {
            // 不存在
            fs.mkdirSync(folder);
        }
    };

    function copyAudio(bookId, lessonId, contentId, audioPath) {
        var bookFolder = path.join(serverPath, "../public/uploads/books", bookId),
            lessonFolder = path.join(bookFolder, lessonId),
            newPath = path.join(lessonFolder, contentId + ".mp3");

        validateFolder(bookFolder);
        validateFolder(lessonFolder);
        // cut the audio
        fs.renameSync(audioPath, newPath);
    };

    // 添加音频到系统
    app.post('/admin/audio', upload.single('audio'), function (req, res, next) {
        var contentType = req.body.contentType,
            number = parseInt(req.body.number) + 1,
            lessonId = req.body.lessonId,
            uploadFile = path.join(serverPath, "../public/uploads/", req.file.filename);

        LessonContent.findAll({
                'where': {
                    lessonId: lessonId,
                    contentType: contentType,
                    isDeleted: false
                },
                order: [
                    ['sequence'],
                    ['createdDate'],
                    ['_id']
                ],
                offset: parseInt(req.body.number)
            })
            .then(function (content) {
                if (content && content.length > 0) {
                    //找到了就要查找书名并拷贝音频
                    Lesson.getFilter({
                            _id: lessonId
                        })
                        .then(function (lessonObject) {
                            if (lessonObject) {
                                //找到书名拷贝音频
                                copyAudio(lessonObject.bookId, lessonId, content[0]._id, uploadFile);
                                res.jsonp({
                                    sucess: true
                                });
                            } else {
                                //没找到书名
                                res.jsonp({
                                    error: "沒有找到该书！"
                                });
                            }
                        })
                        .catch(function () {
                            res.jsonp({
                                error: "拷贝音频出错！"
                            });
                        });

                } else {
                    res.jsonp({
                        error: "沒有找到" + getTextByContentType(contentType, number)
                    });
                }
            });
    });

    function downloadPicture(list, i, uploadFolder) {
        var data = list[i];
        if (!data || !data[0]) {
            return;
        }

        var strArr = data[2].split(";"),
            name = strArr[0].split(":")[1],
            mobile = strArr[4].split(":")[1],
            url = strArr[5].substr(6),
            newFile = path.join(uploadFolder, 'pics', name + mobile + '.jpg');
        if (!fs.existsSync(newFile)) {
            var x = request(url)
                .pipe(fs.createWriteStream(newFile))
                .on("close", function () {
                    downloadPicture(list, i + 1, uploadFolder);
                });
        } else {
            downloadPicture(list, i + 1, uploadFolder);
        }
    };

    // 下载新概念报名照片到本地
    app.post('/admin/downloadPic', upload.single('avatar'), function (req, res, next) {
        var uploadFolder = path.join(serverPath, "../public/uploads/");
        var list = xlsx.parse(path.join(uploadFolder, req.file.filename));

        downloadPicture(list[0].data, 1, uploadFolder);
        res.jsonp({});
    });
}