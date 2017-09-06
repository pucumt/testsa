var xlsx = require("node-xlsx"),
    rawXLSX = require("xlsx"),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    StudentAccount = require('../../models/studentAccount.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    ScoreFails = require('../../models/scoreFails.js'),
    AddStudentToClassFails = require('../../models/addStudentToClassFails.js'),
    AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    ExamClass = require('../../models/examClass.js'),
    TrainClass = require('../../models/trainClass.js'),
    auth = require("./auth"),
    archiver = require('archiver'),
    crypto = require('crypto'),
    Year = require('../../models/year.js'),
    Grade = require('../../models/grade.js'),
    Subject = require('../../models/subject.js'),
    Category = require('../../models/category.js'),
    ClassRoom = require('../../models/classRoom.js'),
    SchoolArea = require('../../models/schoolArea.js'),
    ClassAttribute = require('../../models/classAttribute.js'),
    RebateEnrollTrain = require('../../models/rebateEnrollTrain.js'),
    Coupon = require('../../models/coupon.js'),
    CouponAssign = require('../../models/couponAssign.js'),
    Teacher = require('../../models/teacher.js'),
    OrderFromBank = require('../../models/orderFromBank.js'),
    Lesson = require('../../models/lesson.js'),
    LessonContent = require('../../models/lessonContent.js'),
    Book = require('../../models/book.js'),

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
    function updateScore(score, examId, subject) {
        StudentAccount.getFilter({
            name: score[1]
        }).then(function (account) {
            if (account) {
                StudentInfo.getFilter({
                        accountId: account._id,
                        name: score[0]
                    })
                    .then(function (student) {
                        if (student) {
                            AdminEnrollExam.getFilter({
                                    examId: examId,
                                    studentId: student._id,
                                    isSucceed: 1
                                })
                                .then(function (order) {
                                    if (order) {
                                        order.scores.some(function (orderScore) {
                                            if (orderScore.subjectId == subject) {
                                                orderScore.score = score[2];
                                                orderScore.report = student.name + "_" + account.name + "_" + orderScore.subjectName + "_" + order.examName.substr(0, 19) + ".pdf";
                                                return true;
                                            }
                                        });
                                        order.save();
                                    } else {
                                        failedScore(score[0], score[1], score[2], examId, subject);
                                    }
                                });
                        } else {
                            failedScore(score[0], score[1], score[2], examId, subject);
                        }
                    });
            } else {
                failedScore(score[0], score[1], score[2], examId, subject);
            }
        });
    };

    function failedScore(name, mobile, score, examId, subject) {
        var newScoreFails = new ScoreFails({
            name: name, //score[0],
            mobile: mobile, //score[1],
            score: score, //score[2],
            examId: examId,
            subject: subject
        });
        return newScoreFails.save();
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
        ScoreFails.clearAll().then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/score', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            updateScore(list[0].data[i], req.body.examId, req.body.subject);
        }
        // res.redirect('/admin/score');
        res.jsonp({});
    });

    function addBankOrder(score) {
        OrderFromBank.getFilter({
                orderId: score[8].substr(1)
            })
            .then(function (existOrder) {
                if (!existOrder) {
                    var newOrder = new OrderFromBank({
                        orderDate: score[0].substr(1),
                        orderId: score[8].substr(1),
                        machine: score[5].substr(1), // qr or online
                        payType: score[10].substr(1), // zhifubao or weixin
                        trainPrice: score[14].substr(1)
                    });
                    newOrder.save()
                        .then(function (order) {
                            return;
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            });
    };

    //提交银行数据
    app.post('/admin/uploadBank', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            addBankOrder(list[0].data[i]);
        }
        // res.redirect('/admin/score');
        res.jsonp({});
    });

    function createNewClass(data) {
        var option = {
            name: data[0].trim(),
            totalStudentCount: data[9],
            totalClassCount: data[8],
            trainPrice: data[10],
            materialPrice: data[11],
            courseStartDate: (new Date(1900, 0, parseInt(data[5]) - 1)),
            courseEndDate: (new Date(1900, 0, parseInt(data[6]) - 1)),
            courseTime: data[7],
            courseContent: data[18] && data[18].trim()
        };
        return TrainClass.getFilter({
            name: data[0].trim(),
            schoolArea: data[14].trim(),
            yearName: data[1].trim()
        }).then(function (existTrainClass) {
            if (existTrainClass) {
                // TrainClass
                //学费 教材费 教室 校区 依赖的考试
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
                    return SchoolArea.getFilter({
                            name: data[14].trim()
                        })
                        .then(function (school) {
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
                                        // option.isWeixin = 2; no need to change original isWeixin
                                    } else if (data[16] && data[16].trim() != "") {
                                        failedAddStudentToClass("", "", data[0].trim(), "没找到原班");
                                        return;
                                    }

                                    if (data[17] && data[17] != "") { //日期类型的处理比较麻烦，TBD
                                        option.protectedDate = (new Date(1900, 0, parseInt(data[17]) - 1));
                                    }
                                    var newTrainClass = new TrainClass(option);
                                    return newTrainClass.update(existTrainClass._id);
                                });
                            });
                        });
                });
            } else {
                option.enrollCount = 0;
                option.isWeixin = 0;
                option.isDeleted = false;
                option.isFull = false;
                return Year.getFilter({
                        name: data[1].trim()
                    })
                    .then(function (year) {
                        option.yearId = year._id;
                        option.yearName = year.name;
                        return Grade.getFilter({
                                name: data[2].trim()
                            })
                            .then(function (grade) {
                                option.gradeId = grade._id;
                                option.gradeName = grade.name;
                                return Subject.getFilter({
                                        name: data[3].trim()
                                    })
                                    .then(function (subject) {
                                        option.subjectId = subject._id;
                                        option.subjectName = subject.name;
                                        return Category.getFilter({
                                                name: data[4].trim()
                                            })
                                            .then(function (category) {
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
                                                        return SchoolArea.getFilter({
                                                                name: data[14].trim()
                                                            })
                                                            .then(function (school) {
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
                                                                            failedAddStudentToClass("", "", data[0].trim(), "没找到原班");
                                                                            return;
                                                                        }

                                                                        if (data[17] && data[17] != "") { //日期类型的处理比较麻烦，TBD
                                                                            option.protectedDate = (new Date(1900, 0, parseInt(data[17]) - 1));
                                                                        }
                                                                        var trainClass = new TrainClass(option);
                                                                        return trainClass.save();
                                                                    });
                                                                });
                                                            }).catch(function () {
                                                                failedAddStudentToClass("", "", data[0].trim(), "没找到校区");
                                                            });
                                                    });
                                                }).catch(function () {
                                                    failedAddStudentToClass("", "", data[0].trim(), "没找到属性");
                                                });
                                            }).catch(function () {
                                                failedAddStudentToClass("", "", data[0].trim(), "没找到难度");
                                            });
                                    }).catch(function () {
                                        failedAddStudentToClass("", "", data[0].trim(), "没找到科目");
                                    });
                            }).catch(function () {
                                failedAddStudentToClass("", "", data[0].trim(), "没找到年级");
                            });
                    }).catch(function () {
                        failedAddStudentToClass("", "", data[0].trim(), "没找到年度");
                    });
            }
        });
    };

    app.post('/admin/batchTrainClass', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        var pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            pArray.push(createNewClass(list[0].data[i]));
        }
        Promise.all(pArray).then(function () {
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
        AddStudentToClassFails.clearAll().then(function () {
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
        var newAddStudentToClassFails = new AddStudentToClassFails({
            name: name, //score[0],
            mobile: mobile, //score[1],
            className: className,
            reason: reason
        });
        newAddStudentToClassFails.save();
    };

    function addStudentToClass(data) {
        var option = {
            isSucceed: 1,
            isPayed: true,
            payWay: 0
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
                                            var newAdminEnrollTrain = new AdminEnrollTrain(option);
                                            return newAdminEnrollTrain.save();
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
                                                        var studentAccount = new StudentAccount({
                                                            name: data[2],
                                                            password: password = md5.update("111111").digest('hex')
                                                        });
                                                        pStudent = studentAccount.save();
                                                    }
                                                    return pStudent.then(function (account) {
                                                        if (account) {
                                                            var studentInfo = new StudentInfo({
                                                                name: data[1].trim(),
                                                                sex: (data[7] && data[7].trim() == "男" ? false : true),
                                                                accountId: account._id,
                                                                mobile: data[2],
                                                                gradeId: grade._id,
                                                                gradeName: grade.name,
                                                                School: data[4] && data[4].trim(),
                                                                className: data[6]
                                                            });
                                                            return studentInfo.save()
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
                                                                                    var newAdminEnrollTrain = new AdminEnrollTrain(option);
                                                                                    return newAdminEnrollTrain.save();
                                                                                }
                                                                            });
                                                                    } else {
                                                                        failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "新增学生出错");
                                                                    }
                                                                });
                                                        } else {
                                                            failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "添加账号出错");
                                                        }
                                                    });
                                                });
                                        } else {
                                            failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "没找到年级");
                                        }
                                    });
                            }
                        });
                } else {
                    failedAddStudentToClass(data[1].trim(), data[2], data[0].trim(), "没找到班级");
                }
            });
    };

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
        // var pArray = [];
        // for (var i = 1; i < length; i++) {
        //     if (!list[0].data[i][0]) {
        //         break;
        //     }
        //     pArray.push(addStudentToClass(list[0].data[i]));
        // }
        // Promise.all(pArray).then(function() {
        //     res.jsonp({ sucess: true });
        // });
    });

    app.get('/admin/score/getAllWithoutPage', checkLogin);
    app.get('/admin/score/getAllWithoutPage', function (req, res) {
        ScoreFails.getAllWithoutPaging()
            .then(function (scoreFails) {
                res.jsonp(scoreFails);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    function updateReport(name, mobile, examId, subject, fileName, res) {
        StudentAccount.getFilter({
            name: mobile
        }).then(function (account) {
            if (account) {
                StudentInfo.getFilter({
                        accountId: account._id,
                        name: name
                    })
                    .then(function (student) {
                        if (student) {
                            AdminEnrollExam.getFilter({
                                    examId: examId,
                                    studentId: student._id,
                                    isSucceed: 1
                                })
                                .then(function (order) {
                                    if (order) {
                                        order.scores.some(function (orderScore) {
                                            if (orderScore.subjectId == subject) {
                                                orderScore.report = fileName;
                                                return true;
                                            }
                                        });
                                        order.save();
                                        res.jsonp({});
                                    } else {
                                        failedScore(name, mobile, "0", examId, subject);
                                        res.jsonp({});
                                    }
                                }).catch(function (error) {
                                    res.jsonp({
                                        error: error
                                    });
                                });
                        } else {
                            failedScore(name, mobile, "0", examId, subject);
                            res.jsonp({});
                        }
                    }).catch(function (error) {
                        res.jsonp({
                            error: error
                        });
                    });
            } else {
                failedScore(name, mobile, "0", examId, subject);
                res.jsonp({});
            }
        }).catch(function (error) {
            res.jsonp({
                error: error
            });
        });
    };

    app.post('/admin/export/scoreTemplate', function (req, res) {
        var data = [
            ['姓名', '联系方式', '成绩']
        ];
        var p = AdminEnrollExam.getFilters({
                examId: req.body.examId,
                isSucceed: 1
            })
            .then(function (orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function (order) {
                        var Px = StudentInfo.get(order.studentId).then(function (student) {
                            if (student && student.accountId) {
                                return StudentAccount.get(student.accountId).then(function (account) {
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
            ['姓名', '联系方式', '考场', '学校', '班级', '成绩']
        ];
        var p = AdminEnrollExam.getFilters({
                examId: req.body.examId,
                isSucceed: 1
            })
            .then(function (orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function (order) {
                        var Px = StudentInfo.get(order.studentId).then(function (student) {
                            if (student && student.accountId) {
                                return StudentAccount.get(student.accountId).then(function (account) {
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
                    deleteall(curPath);
                } else { // delete file  
                    fs.unlinkSync(curPath);
                }
            });
        }
    };

    app.post('/admin/export/reportTemplate', function (req, res) {
        var outputPath = path.join(serverPath, "../public/downloads/", req.body.examId + ".zip");
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        var disPath = path.join(serverPath, "../public/downloads/", req.body.examId);
        deleteFilesInFolder(disPath);
        var src = path.join(serverPath, "../public/downloads/reportTemplate_" + req.body.subject + ".doc");
        var copyFile = function () {
            var p = AdminEnrollExam.getFilters({
                    examId: req.body.examId,
                    isSucceed: 1
                })
                .then(function (orders) {
                    if (orders.length > 0) {
                        var PArray = [];
                        orders.forEach(function (order) {
                            var Px = StudentInfo.get(order.studentId).then(function (student) {
                                if (student) {
                                    return StudentAccount.get(student.accountId).then(function (account) {
                                        var fileName = student.name + '_' + account.name + '_' + req.body.subject + '_' + req.body.exam.substr(0, 19) + '.doc';
                                        fs.createReadStream(src).pipe(fs.createWriteStream(path.join(disPath, fileName)));
                                    });
                                }
                            });
                            PArray.push(Px);
                        });
                        return Promise.all(PArray);
                    }
                });
            p.then(function () {
                var output = fs.createWriteStream(outputPath);
                archive = archiver('zip', {
                    store: true // Sets the compression method to STORE. 
                });
                archive.pipe(output);
                archive.directory(disPath, "");
                archive.finalize();
                res.jsonp({
                    sucess: true
                });
            }).catch(function (error) {
                res.jsonp({
                    error: error
                });
            });
        };
        fs.exists(disPath, function (exists) {
            // 已存在
            if (exists) {
                copyFile();
            }
            // 不存在
            else {
                fs.mkdir(disPath, function () {
                    copyFile();
                });
            }
        });
    });

    app.post('/admin/export/classTemplate', function (req, res) {
        var data = [
            ['姓名', '联系方式', '年级', '科目']
        ];
        var p = AdminEnrollExam.getFilters({
                examId: req.body.examId,
                isSucceed: 1
            })
            .then(function (orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function (order) {
                        var Px = StudentInfo.get(order.studentId).then(function (student) {
                            if (student) {
                                var p2Array = [],
                                    singleInfo = [student.name, student.mobile];
                                return AdminEnrollTrain.getFilters({
                                    studentId: student._id,
                                    isSucceed: 1
                                }).then(function (classOrders) {
                                    if (classOrders && classOrders.length > 0) {
                                        classOrders.forEach(function (newOrder) {
                                            var pClass = TrainClass.get(newOrder.trainId)
                                                .then(function (newClass) {
                                                    singleInfo.push(newClass.gradeName);
                                                    singleInfo.push(newClass.subjectName);
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
                fileName = '报名情况2' + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({
                sucess: true
            });
            // res.redirect('/admin/export/scoreTemplate?name=' + encodeURI(fileName));
        });
    });

    app.post('/admin/export/classTemplate2', function (req, res) {
        var data = [
            ['课程', '年级', '科目', '难度', '校区', '报名人数', '总人数']
        ];
        var p = TrainClass.getFilters({
                yearId: global.currentYear._id
            })
            .then(function (classes) {
                if (classes.length > 0) {
                    classes.forEach(function (order) {
                        data.push([order.name, order.gradeName, order.subjectName, order.categoryName, order.schoolArea, order.enrollCount, order.totalStudentCount]);
                    });
                    var buffer = xlsx.build([{
                            name: "课程",
                            data: data
                        }]),
                        fileName = '课程报名情况' + '.xlsx';
                    fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
                    res.jsonp({
                        sucess: true
                    });
                }
            });
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
                        var Px = StudentInfo.get(order.studentId).then(function (student) {
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
                                            var pClass = TrainClass.get(newOrder.trainId)
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
            // res.redirect('/admin/export/scoreTemplate?name=' + encodeURI(fileName));
        });
    });

    app.post('/admin/export/classTemplate4', function (req, res) {
        var data = [
            ['姓名', '联系方式', '年级', '科目', '时间', '校区', '培训费', '教材费', '年级', '科目', '时间', '校区', '培训费', '教材费', '年级', '科目', '时间', '校区', '培训费', '教材费']
        ];
        var p = AdminEnrollTrain.getDistinctStudents({}).then(function (students) {
            if (students.length > 0) {
                var PArray = [];
                students.forEach(function (studentId) {
                    var Px = StudentInfo.get(studentId).then(function (student) {
                        if (student) {
                            var p2Array = [],
                                singleInfo = [student.name, student.mobile, '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
                            return AdminEnrollTrain.getFilters({
                                studentId: student._id,
                                isSucceed: 1
                            }).then(function (classOrders) {
                                if (classOrders && classOrders.length > 0) {
                                    classOrders.forEach(function (newOrder) {
                                        var pClass = TrainClass.get(newOrder.trainId)
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
                            data.push([studentId]);
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
                fileName = '报名情况4' + '.xlsx';
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
            }).then(function (oldOrder) {
                return getOrderPayway(oldOrder);
            });
        } else {
            return Promise.resolve(getPayway(order.payWay));
        }
    };

    //导出所以报名订单
    app.post('/admin/export/classTemplate5', function (req, res) {
        var data = [
            ['姓名', '联系方式', '学生学校', '学生班级', '性别', '报名日期', '科目', '校区', '课程', '上课时间', '年级', '培训费', '教材费', '退费', '支付方式', '备注']
        ];
        var filter = {
            isDeleted: {
                $ne: true
            },
            isSucceed: 1,
            yearId: global.currentYear._id.toJSON(),
            isPayed: true
        };
        var p = AdminEnrollTrain.getFiltersWithClass(filter)
            .then(function (orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function (order) {
                        var Px = StudentInfo.get(order.studentId).then(function (student) {
                            if (student) {
                                return getOrderPayway(order)
                                    .then(function (way) {
                                        var newClass = order.trainClasss[0] || {};
                                        var singleInfo = [student.name, student.mobile, student.School, student.className, (student.sex ? "女" : "男"), order.orderDate, newClass.subjectName, newClass.schoolArea, newClass.name, newClass.courseTime, newClass.gradeName, order.totalPrice, order.realMaterialPrice, order.rebatePrice, way, order.comment];
                                        data.push(singleInfo);
                                    });
                            } else {
                                data.push([order.studentId, order._id, order.orderDate, order.trainId]);
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
                fileName = '报名情况5' + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({
                sucess: true
            });
        });
    });

    //导出所有课程情况
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

    //给订单添加年度
    app.post('/admin/adminEnrollTrain/addYearToOrder', checkLogin);
    app.post('/admin/adminEnrollTrain/addYearToOrder', function (req, res) {
        AdminEnrollTrain.getSpecialFilters({})
            .then(function (orders) {
                if (orders && orders.length > 0) {
                    var pArray = [];
                    orders.forEach(function (order) {
                        var p = TrainClass.get(order.trainId)
                            .then(function (trainClass) {
                                if (trainClass) {
                                    return AdminEnrollTrain.updateyear(order._id, {
                                        yearId: trainClass.yearId,
                                        yearName: trainClass.yearName
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

    //给订单添加校区
    app.post('/admin/adminEnrollTrain/addSchoolToOrder', checkLogin);
    app.post('/admin/adminEnrollTrain/addSchoolToOrder', function (req, res) {
        AdminEnrollTrain.getSpecialFilters({})
            .then(function (orders) {
                if (orders && orders.length > 0) {
                    var pArray = [];
                    orders.forEach(function (order) {
                        var p = TrainClass.get(order.trainId)
                            .then(function (trainClass) {
                                if (trainClass) {
                                    //updateyear also could update other attributes
                                    return AdminEnrollTrain.updateyear(order._id, {
                                        schoolId: trainClass.schoolId,
                                        schoolArea: trainClass.schoolArea
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

    //重复账号合并
    app.post('/admin/studentAccount/DuplicateAccount', checkLogin);
    app.post('/admin/studentAccount/DuplicateAccount', function (req, res) {
        var deleteCount = 0;
        StudentInfo.getAllDuplicated({})
            .then(function (specialStudents) {
                var pArray = []
                specialStudents.forEach(function (specialStudent) {
                    var p = StudentInfo.getFilters({
                            name: specialStudent._id.name,
                            mobile: specialStudent._id.mobile
                        })
                        .then(function (students) {
                            if (students.length > 0) {
                                var realStudent = students[0];
                                var pChildStudentArray = [];
                                for (var i = 1; i < students.length; i++) {
                                    //1. update examorder
                                    var pChildStudent1 = AdminEnrollExam.updateUserInfo({
                                        studentId: students[i]._id
                                    }, {
                                        studentId: realStudent._id
                                    });
                                    pChildStudentArray.push(pChildStudent1);
                                    //2. update train order
                                    var pChildStudent2 = AdminEnrollTrain.updateUserInfo({
                                        studentId: students[i]._id
                                    }, {
                                        studentId: realStudent._id
                                    });
                                    pChildStudentArray.push(pChildStudent2);
                                    //3. delete useless account and user
                                    var pChildStudent3 = StudentInfo.deleteUser(students[i]._id);
                                    pChildStudentArray.push(pChildStudent3);

                                    if (students[i].accountId != realStudent.accountId) {
                                        var pChildStudent4 = StudentAccount.deleteAccount(students[i].accountId);
                                        pChildStudentArray.push(pChildStudent4);
                                    }
                                }
                                var pChildStudent5 = StudentAccount.getSpecial(realStudent.accountId).then(function (account) {
                                    if (account) {
                                        if (account.isDeleted) {
                                            return StudentAccount.recoverAccount(realStudent.accountId);
                                        }
                                    } else {
                                        return failedAddStudentToClass(specialStudent._id.name, specialStudent._id.mobile, realStudent.accountId, "没找到第一个账号");
                                    }
                                });
                                pChildStudentArray.push(pChildStudent5);
                                return Promise.all(pChildStudentArray);
                            } else {
                                return failedAddStudentToClass(specialStudent._id.name, specialStudent._id.mobile, "", "没找到");
                            }
                        });
                    pArray.push(p);
                });
                Promise.all(pArray).then(function () {
                    res.jsonp({
                        sucess: true
                    });
                });
            });
    });

    //重复账号合并
    app.post('/admin/studentAccount/OnlyDuplicateAccount', checkLogin);
    app.post('/admin/studentAccount/OnlyDuplicateAccount', function (req, res) {
        var deleteCount = 0;
        StudentAccount.getAllDuplicated({})
            .then(function (specialAccounts) {
                var pArray = []
                specialAccounts.forEach(function (specialAccount) {
                    var p = StudentAccount.getFilters({
                            name: specialAccount._id
                        })
                        .then(function (accounts) {
                            if (accounts.length > 1) {
                                var realAccount = accounts[0];
                                var pChildAccountArray = [];
                                for (var i = 1; i < accounts.length; i++) {
                                    //1. update student
                                    var pChildAccount1 = StudentInfo.updateUserInfo({
                                        accountId: accounts[i]._id
                                    }, {
                                        accountId: realAccount._id
                                    });
                                    pChildAccountArray.push(pChildAccount1);
                                    //2. delete useless account
                                    var pChildAccount2 = StudentAccount.deleteAccount(accounts[i]._id);
                                    pChildAccountArray.push(pChildAccount2);
                                }
                                return Promise.all(pChildAccountArray);
                            } else {
                                return failedAddStudentToClass(specialAccount._id, "", "", "没找到");
                            }
                        });
                    pArray.push(p);
                });
                Promise.all(pArray).then(function () {
                    res.jsonp({
                        sucess: true
                    });
                });
            });
    });

    //3门报名情况 主要用于小升初
    app.post('/admin/export/gradeMOneList', function (req, res) {
        var data = [
            ['学生', '电话', '课程', '培训费', '教材费', '课程', '培训费', '教材费', '课程', '培训费', '教材费']
        ];
        return AdminEnrollTrain.get3ordersOfPeople(global.currentYear._id, req.body.gradeId)
            .then(function (people) {
                var pArray = [];
                people.forEach(function (person) {
                    var p = StudentInfo.get(person._id.studentId)
                        .then(function (student) {
                            var singleInfo
                            if (student) {
                                singleInfo = [student.name, student.mobile];
                            } else {
                                singleInfo = [person._id.studentId, ""];
                            }
                            data.push(singleInfo);
                            return AdminEnrollTrain.getFilters({
                                studentId: person._id.studentId,
                                yearId: global.currentYear._id,
                                isSucceed: 1
                            }).then(function (orders) {
                                orders.forEach(function (order) {
                                    singleInfo.push(order.trainName);
                                    singleInfo.push(order.totalPrice);
                                    singleInfo.push(order.realMaterialPrice);
                                })
                            });
                        });
                    pArray.push(p);
                });
                Promise.all(pArray).then(function () {
                    var buffer = xlsx.build([{
                            name: "报名情况",
                            data: data
                        }]),
                        fileName = '小升初3门报名情况' + '.xlsx';
                    fs.writeFileSync(path.join(serverPath, "../public/downloads/", fileName), buffer, 'binary');
                    res.jsonp({
                        sucess: true
                    });
                });
            });
    });

    //退费报表
    app.post('/admin/export/rebateAllList', function (req, res) {
        var data = [
            ['学生', '电话', '订单', '课程', '校区', '年级', '科目', '退费', '退费日期']
        ];
        RebateEnrollTrain.getFilters({})
            .then(function (rebates) {
                var pArray = [];
                rebates.forEach(function (rebate) {
                    var p = AdminEnrollTrain.get(rebate.trainOrderId)
                        .then(function (order) {
                            return TrainClass.get(order.trainId)
                                .then(function (originalClass) {
                                    var singleInfo = [order.studentName, order.mobile, order._id, order.trainName, originalClass.schoolArea, originalClass.gradeName, originalClass.subjectName, rebate.rebatePrice, rebate.createDate];
                                    data.push(singleInfo);
                                });
                        });
                    pArray.push(p);
                });
                Promise.all(pArray).then(function () {
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
    });

    //已经支付，但被系统误认为取消的订单
    app.post('/admin/export/otherOrder1', function (req, res) {
        var data = [
            ['学生', '电话', '订单', '订单日期', '课程', '校区', '年级', '科目', '退费']
        ];
        AdminEnrollTrain.getFilters({
                isSucceed: 9,
                isPayed: true,
                fromId: null,
                payWay: 6
            })
            .then(function (orders) {
                var pArray = [];
                orders.forEach(function (order) {
                    var p = AdminEnrollTrain.getFilter({
                            fromId: order._id
                        })
                        .then(function (changeOrder) {
                            if (!changeOrder) {
                                return TrainClass.get(order.trainId)
                                    .then(function (originalClass) {
                                        var singleInfo = [order.studentName, order.mobile, order._id, order.orderDate, order.trainName, originalClass.schoolArea, originalClass.gradeName, originalClass.subjectName, order.rebatePrice];
                                        data.push(singleInfo);
                                    });
                            }
                        });
                    pArray.push(p);
                });
                Promise.all(pArray).then(function () {
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

    //rawXLSX 点名列表
    app.post('/admin/export/rollCallList', function (req, res) {
        var workbook = rawXLSX.readFile(path.join(serverPath, "../public/downloads/", 'test.xlsx'));
        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];
        var new_ws_name = "SheetJS";

        /* make worksheet */
        var ws_data = [
            ["S", "h", "e", "e", "t", "J", "S"],
            [1, 2, 3, 4, 5]
        ];
        var ws = rawXLSX.utils.aoa_to_sheet(ws_data);

        /* Add the sheet name to the list */
        workbook.SheetNames.push(new_ws_name);

        /* Load the worksheet object */
        workbook.Sheets[new_ws_name] = ws;

        rawXLSX.writeFile(workbook, 'out.xlsx');
    });

    function checkstudent(score) {
        StudentInfo.getFilter({
                name: score[0]
            })
            .then(function (student) {
                if (student) {
                    if (student.mobile != score[1]) {
                        failedScore(score[0], score[1], student.mobile, '该学生号码不匹配');
                    }
                } else {
                    failedScore(score[0], score[1], '', '没找到该学生');
                }
            });
    };

    //check is the student is exist in db
    //跟系统学生进行匹配
    app.post('/admin/checkstudent', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            checkstudent(list[0].data[i]);
        }
        // res.redirect('/admin/score');
        res.jsonp({});
    });

    function couponAssignStudent(score, couponId, admin) {
        return StudentInfo.getFilter({
                name: score[0],
                mobile: score[1]
            })
            .then(function (student) {
                if (student) {
                    return Coupon.get(couponId)
                        .then(function (coupon) {
                            return CouponAssign.getFilter({
                                    couponId: coupon._id,
                                    studentId: student._id
                                })
                                .then(function (couponAssign) {
                                    if (!couponAssign) {
                                        //assign student with coupon
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
                                            studentId: student._id,
                                            studentName: student.name,
                                            createdBy: admin._id
                                        });
                                        return couponAssign.save();
                                    }
                                });
                        });
                } else {
                    //create new student and assign with coupon
                    return failedScore(score[0], score[1], '', '没找到该学生');
                }
            });
    };

    //if student in db, assign it. it not, created and assign
    //批量给系统学生分配优惠券
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
                    return Coupon.get(couponId)
                        .then(function (coupon) {
                            if (coupon) {
                                //remove coupon from student
                                return CouponAssign.batchUpdate({
                                    couponId: coupon._id,
                                    studentId: student._id
                                }, {
                                    isDeleted: true
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

    //if student in db, assign it. it not, created and assign
    //批量删除学生的优惠券
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
                                classRoom = new ClassRoom({
                                    name: score[0],
                                    sCount: score[1],
                                    schoolId: school._id,
                                    schoolArea: school.name
                                });
                                return classRoom.save();
                            }
                        });
                } else {
                    return failedScore(score[0], score[1], score[2], "没找到校区");
                }
            });
    };

    //批量添加教室
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
                    teacher = new Teacher({
                        name: score[0].trim(),
                        mobile: score[2],
                        engName: score[1] && score[1].trim(),
                        password: md5.update("111111").digest('hex')
                    });
                    return teacher.save();
                }
            });
    };

    //批量添加老师
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
                                var newTrainClass = new TrainClass(option);
                                return newTrainClass.update(existTrainClass._id);
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

    //批量添加 “老师/教室/课文” 到课程
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
        Promise.all(pArray).then(function () {
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

    //添加音频到系统
    app.post('/admin/audio', upload.single('audio'), function (req, res, next) {
        var contentType = req.body.contentType,
            number = parseInt(req.body.number) + 1,
            lessonId = req.body.lessonId,
            uploadFile = path.join(serverPath, "../public/uploads/", req.file.filename);

        LessonContent.getContentOfSequence({
            lessonId: lessonId,
            contentType: contentType
        }, parseInt(req.body.number)).then(function (content) {
            if (content && content.length > 0) {
                //找到了就要查找书名并拷贝音频
                Lesson.get(lessonId)
                    .then(function (lessonObject) {
                        if (lessonObject) {
                            //找到书名拷贝音频
                            copyAudio(lessonObject.bookId.toJSON(), lessonId, content[0]._id.toJSON(), uploadFile);
                            res.jsonp({
                                sucess: true
                            });
                        } else {
                            //没找到书名
                            res.jsonp({
                                error: "沒有找到该书！"
                            });
                        }
                    }).catch(function () {
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
            url = strArr[3].substr(5),
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
        //list[0].data[0] [0] [1] [2]
        // var length = list[0].data.length;
        // for (var i = 1; i < 2; i++) {
        //     if (!list[0].data[i][0]) {
        //         break;
        //     }

        downloadPicture(list[0].data, 1, uploadFolder);

        // var data = list[0].data[i],
        //     strArr = data[2].split(";"),
        //     name = strArr[0].split(":")[1],
        //     mobile = strArr[4].split(":")[1],
        //     url = strArr[3].substr(5);

        // var x = request(url)
        //     .pipe(fs.createWriteStream(path.join(uploadFolder, 'pics', name + mobile + '.jpg')));
        // }
        // res.redirect('/admin/score');
        res.jsonp({});
    });
}