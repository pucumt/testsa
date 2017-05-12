var xlsx = require("node-xlsx"),
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
    Year = require('../../models/year.js'),
    Grade = require('../../models/grade.js'),
    Subject = require('../../models/subject.js'),
    Category = require('../../models/category.js'),
    ClassRoom = require('../../models/classRoom.js'),
    SchoolArea = require('../../models/schoolArea.js'),
    ClassAttribute = require('../../models/classAttribute.js'),

    checkLogin = auth.checkLogin,
    serverPath = __dirname,
    storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/uploads/');
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname);
        }
    }),
    upload = multer({ storage: storage });

module.exports = function(app) {
    function updateScore(score, examId, subject) {
        StudentAccount.getFilter({ name: score[1] }).then(function(account) {
            if (account) {
                StudentInfo.getFilter({ accountId: account._id, name: score[0] })
                    .then(function(student) {
                        if (student) {
                            AdminEnrollExam.getFilter({ examId: examId, studentId: student._id, isSucceed: 1 })
                                .then(function(order) {
                                    if (order) {
                                        order.scores.some(function(orderScore) {
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
        newScoreFails.save();
    };

    app.get('/admin/score', checkLogin);
    app.get('/admin/score', function(req, res) {
        res.render('Server/scoreResult.html', {
            title: '>成绩导入结果失败列表',
            user: req.session.admin
        });
    });

    app.get('/admin/score/clearAll', checkLogin);
    app.get('/admin/score/clearAll', function(req, res) {
        ScoreFails.clearAll().then(function() {
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/score', upload.single('avatar'), function(req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../../public/uploads/", req.file.filename));
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

    function createNewClass(data) {
        var option = {
            name: data[0],
            totalStudentCount: data[9],
            totalClassCount: data[8],
            trainPrice: data[10],
            materialPrice: data[11],
            courseStartDate: (new Date(1900, 0, parseInt(data[5]) - 1)),
            courseEndDate: (new Date(1900, 0, parseInt(data[6]) - 1)),
            courseTime: data[7],
            courseContent: data[18].trim()
        };
        TrainClass.getFilter({ name: data[0], schoolArea: data[14].trim() }).then(function(existTrainClass) {
            if (existTrainClass) {
                // TrainClass
                //学费 教材费 教室 校区 依赖的考试
                var pRoom;
                if (data[13] && data[13].trim() != "") {
                    pRoom = ClassRoom.getFilter({ name: data[13].trim() });
                } else {
                    pRoom = Promise.resolve();
                }
                return pRoom.then(function(classRoom) {
                    if (classRoom) {
                        option.classRoomId = classRoom._id;
                        option.classRoomName = classRoom.name;
                    }
                    return SchoolArea.getFilter({ name: data[14].trim() })
                        .then(function(school) {
                            option.schoolId = school._id;
                            option.schoolArea = school.name;

                            var pExams, examArray = [];
                            if (data[15] && data[15].trim() != "") {
                                var pExamArray = [];
                                var exams = data[15].split(",");
                                exams.forEach(function(exam) {
                                    var examScore = exam.split(":");
                                    var pExamClass = ExamClass.getFilter({ name: examScore[0].trim() })
                                        .then(function(examClass) {
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
                            return pExams.then(function() {
                                if (examArray.length > 0) {
                                    option.exams = examArray;
                                }
                                var newTrainClass = new TrainClass(option);
                                return newTrainClass.update(existTrainClass._id);
                            });
                        });
                });
            } else {
                option.enrollCount = 0;
                option.isWeixin = 0;
                option.isDeleted = false;
                option.isFull = false;
                return Year.getFilter({ name: data[1].trim() })
                    .then(function(year) {
                        option.yearId = year._id;
                        option.yearName = year.name;
                        return Grade.getFilter({ name: data[2].trim() })
                            .then(function(grade) {
                                option.gradeId = grade._id;
                                option.gradeName = grade.name;
                                return Subject.getFilter({ name: data[3].trim() })
                                    .then(function(subject) {
                                        option.subjectId = subject._id;
                                        option.subjectName = subject.name;
                                        return Category.getFilter({ name: data[4].trim() })
                                            .then(function(category) {
                                                option.categoryId = category._id;
                                                option.categoryName = category.name;
                                                var pAttribute;
                                                if (data[12] && data[12].trim() != "") {
                                                    pAttribute = ClassAttribute.getFilter({ name: data[12].trim() });
                                                } else {
                                                    pAttribute = Promise.resolve();
                                                }
                                                return pAttribute.then(function(classattribute) {
                                                    if (classattribute) {
                                                        option.attributeId = classattribute._id;
                                                        option.attributeName = classattribute.name;
                                                    }
                                                    var pRoom;
                                                    if (data[13] && data[13].trim() != "") {
                                                        pRoom = ClassRoom.getFilter({ name: data[13].trim() });
                                                    } else {
                                                        pRoom = Promise.resolve();
                                                    }
                                                    return pRoom.then(function(classRoom) {
                                                        if (classRoom) {
                                                            option.classRoomId = classRoom._id;
                                                            option.classRoomName = classRoom.name;
                                                        }
                                                        return SchoolArea.getFilter({ name: data[14].trim() })
                                                            .then(function(school) {
                                                                option.schoolId = school._id;
                                                                option.schoolArea = school.name;

                                                                var pExams, examArray = [];
                                                                if (data[15] && data[15].trim() != "") {
                                                                    var pExamArray = [];
                                                                    var exams = data[15].split(",");
                                                                    exams.forEach(function(exam) {
                                                                        var examScore = exam.split(":");
                                                                        var pExamClass = ExamClass.getFilter({ name: examScore[0].trim() })
                                                                            .then(function(examClass) {
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
                                                                return pExams.then(function() {
                                                                    if (examArray.length > 0) {
                                                                        option.exams = examArray;
                                                                    }
                                                                    var pTrainClass;
                                                                    if (data[16] && data[16].trim() != "") {
                                                                        pTrainClass = TrainClass.getFilter({ name: data[16].trim() });
                                                                    } else {
                                                                        pTrainClass = Promise.resolve();
                                                                    }
                                                                    return pTrainClass.then(function(trainClass) {
                                                                        if (trainClass) {
                                                                            option.fromClassId = trainClass._id;
                                                                            option.fromClassName = trainClass.name;
                                                                        }
                                                                        if (data[17] && data[17] != "") { //日期类型的处理比较麻烦，TBD
                                                                            option.protectedDate = (new Date(1900, 0, parseInt(data[17]) - 1));
                                                                        }
                                                                        var trainClass = new TrainClass(option);
                                                                        return trainClass.save();
                                                                    });
                                                                });
                                                            });
                                                    });
                                                });
                                            });
                                    });
                            });
                    });
            }
        });
    };

    app.post('/admin/batchTrainClass', upload.single('avatar'), function(req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        var pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            pArray.push(createNewClass(list[0].data[i]));
        }
        Promise.all(pArray).then(function() {
            res.jsonp({ sucess: true });
        });
    });

    app.get('/admin/batchAddStudentToTrainClassResult', checkLogin);
    app.get('/admin/batchAddStudentToTrainClassResult', function(req, res) {
        res.render('Server/batchAddStudentToTrainClassResult.html', {
            title: '>老生班级导入结果失败列表',
            user: req.session.admin
        });
    });
    app.get('/admin/batchAddStudentToTrainClass/clearAll', checkLogin);
    app.get('/admin/batchAddStudentToTrainClass/clearAll', function(req, res) {
        AddStudentToClassFails.clearAll().then(function() {
            res.jsonp({ sucess: true });
        });
    });
    app.get('/admin/batchAddStudentToTrainClass/all', checkLogin);
    app.get('/admin/batchAddStudentToTrainClass/all', function(req, res) {
        AddStudentToClassFails.getFilters({})
            .then(function(allFails) {
                res.jsonp(allFails);
            })
            .catch((err) => {
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
            isPayed: true,
            payWay: 0
        };
        TrainClass.getFilter({ name: data[0] }).then(function(existTrainClass) {
            if (existTrainClass) {
                option.trainId = existTrainClass._id;
                option.trainName = existTrainClass.name;
                return StudentInfo.getFilter({ name: data[1].trim(), mobile: data[2] })
                    .then(function(student) {
                        if (student) {
                            option.studentId = student._id;
                            option.studentName = student.name;
                            AdminEnrollTrain.getFilter({
                                    trainId: existTrainClass._id,
                                    studentId: student._id,
                                    isSucceed: 1
                                })
                                .then(function(order) {
                                    if (!order) {
                                        var newAdminEnrollTrain = new AdminEnrollTrain(option);
                                        return newAdminEnrollTrain.save();
                                    }
                                });
                        } else {
                            failedAddStudentToClass(data[1].trim(), data[2].trim(), data[0].trim(), "没找到学生");
                        }
                    });
            } else {
                failedAddStudentToClass(data[1].trim(), data[2].trim(), data[0].trim(), "没找到班级");
            }
        });
    };

    app.post('/admin/batchAddStudentToTrainClass', upload.single('avatar'), function(req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        var pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break;
            }
            pArray.push(addStudentToClass(list[0].data[i]));
        }
        Promise.all(pArray).then(function() {
            res.jsonp({ sucess: true });
        });
    });

    app.get('/admin/score/getAllWithoutPage', checkLogin);
    app.get('/admin/score/getAllWithoutPage', function(req, res) {
        ScoreFails.getAllWithoutPaging()
            .then(function(scoreFails) {
                res.jsonp(scoreFails);
            })
            .catch((err) => {
                console.log('errored');
            });
    });

    function updateReport(name, mobile, examId, subject, fileName, res) {
        StudentAccount.getFilter({ name: mobile }).then(function(account) {
            if (account) {
                StudentInfo.getFilter({ accountId: account._id, name: name })
                    .then(function(student) {
                        if (student) {
                            AdminEnrollExam.getFilter({ examId: examId, studentId: student._id, isSucceed: 1 })
                                .then(function(order) {
                                    if (order) {
                                        order.scores.some(function(orderScore) {
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
                                }).catch(function(error) {
                                    res.jsonp({ error: error });
                                });
                        } else {
                            failedScore(name, mobile, "0", examId, subject);
                            res.jsonp({});
                        }
                    }).catch(function(error) {
                        res.jsonp({ error: error });
                    });
            } else {
                failedScore(name, mobile, "0", examId, subject);
                res.jsonp({});
            }
        }).catch(function(error) {
            res.jsonp({ error: error });
        });
    };

    app.post('/admin/export/scoreTemplate', function(req, res) {
        var data = [
            ['姓名', '联系方式', '成绩']
        ];
        var p = AdminEnrollExam.getFilters({ examId: req.body.examId, isSucceed: 1 })
            .then(function(orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function(order) {
                        var Px = StudentInfo.get(order.studentId).then(function(student) {
                            if (student && student.accountId) {
                                return StudentAccount.get(student.accountId).then(function(account) {
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

        p.then(function() {
            var buffer = xlsx.build([{ name: "成绩", data: data }]),
                fileName = req.body.exam.substr(0, 19) + '_' + req.body.subject + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({ sucess: true });
            // res.redirect('/admin/export/scoreTemplate?name=' + encodeURI(fileName));
        });
    });

    app.post('/admin/export/scoreSchoolTemplate', function(req, res) {
        var data = [
            ['姓名', '联系方式', '学校', '班级', '成绩']
        ];
        var p = AdminEnrollExam.getFilters({ examId: req.body.examId, isSucceed: 1 })
            .then(function(orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function(order) {
                        var Px = StudentInfo.get(order.studentId).then(function(student) {
                            if (student && student.accountId) {
                                return StudentAccount.get(student.accountId).then(function(account) {
                                    data.push([student.name, account.name, student.School, student.className]);
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

        p.then(function() {
            var buffer = xlsx.build([{ name: "成绩", data: data }]),
                fileName = req.body.exam.substr(0, 19) + '_' + req.body.subject + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({ sucess: true });
            // res.redirect('/admin/export/scoreTemplate?name=' + encodeURI(fileName));
        });
    });

    app.get('/admin/export/scoreTemplate', checkLogin);
    app.get('/admin/export/scoreTemplate', function(req, res) {
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
            files.forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse  
                    deleteall(curPath);
                } else { // delete file  
                    fs.unlinkSync(curPath);
                }
            });
        }
    };
    app.post('/admin/export/reportTemplate', function(req, res) {
        var outputPath = path.join(serverPath, "../../public/downloads/", req.body.examId + ".zip");
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        var disPath = path.join(serverPath, "../../public/downloads/", req.body.examId);
        deleteFilesInFolder(disPath);
        var src = path.join(serverPath, "../../public/downloads/reportTemplate_" + req.body.subject + ".doc");
        var copyFile = function() {
            var p = AdminEnrollExam.getFilters({ examId: req.body.examId, isSucceed: 1 })
                .then(function(orders) {
                    if (orders.length > 0) {
                        var PArray = [];
                        orders.forEach(function(order) {
                            var Px = StudentInfo.get(order.studentId).then(function(student) {
                                return StudentAccount.get(student.accountId).then(function(account) {
                                    var fileName = student.name + '_' + account.name + '_' + req.body.subject + '_' + req.body.exam + '.doc';
                                    fs.createReadStream(src).pipe(fs.createWriteStream(path.join(disPath, fileName)));
                                });
                            });
                            PArray.push(Px);
                        });
                        return Promise.all(PArray);
                    }
                });
            p.then(function() {
                var output = fs.createWriteStream(outputPath);
                archive = archiver('zip', {
                    store: true // Sets the compression method to STORE. 
                });
                archive.pipe(output);
                archive.directory(disPath, "");
                archive.finalize();
                res.jsonp({ sucess: true });
            }).catch(function(error) {
                res.jsonp({ error: error });
            });
        };
        fs.exists(disPath, function(exists) {
            // 已存在
            if (exists) {
                copyFile();
            }
            // 不存在
            else {
                fs.mkdir(disPath, function() {
                    copyFile();
                });
            }
        });
    });

    app.post('/admin/export/classTemplate', function(req, res) {
        var data = [
            ['姓名', '联系方式', '科目']
        ];
        var p = AdminEnrollExam.getFilters({ examId: req.body.examId, isSucceed: 1 })
            .then(function(orders) {
                if (orders.length > 0) {
                    var PArray = [];
                    orders.forEach(function(order) {
                        var Px = StudentInfo.get(order.studentId).then(function(student) {
                            if (student) {
                                var p2Array = [],
                                    singleInfo = [student.name, student.mobile];
                                return AdminEnrollTrain.getFilters({
                                    studentId: student._id,
                                    isSucceed: 1
                                }).then(function(classOrders) {
                                    if (classOrders && classOrders.length > 0) {
                                        classOrders.forEach(function(newOrder) {
                                            var pClass = TrainClass.get(newOrder.trainId)
                                                .then(function(newClass) {
                                                    singleInfo.push(newClass.subjectName);
                                                });
                                            p2Array.push(pClass);
                                        });
                                        return Promise.all(p2Array);
                                    } else {
                                        return Promise.all([]);
                                    }
                                }).then(function() {
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
        p.then(function() {
            var buffer = xlsx.build([{ name: "报名情况", data: data }]),
                fileName = '报名情况2' + '.xlsx';
            fs.writeFileSync(path.join(serverPath, "../../public/downloads/", fileName), buffer, 'binary');
            res.jsonp({ sucess: true });
            // res.redirect('/admin/export/scoreTemplate?name=' + encodeURI(fileName));
        });
    });

    app.post('/admin/export/classTemplate2', function(req, res) {
        var data = [
            ['课程', '年级', '科目', '难度', '校区', '报名人数', '总人数']
        ];
        var p = TrainClass.getFilters({})
            .then(function(classes) {
                if (classes.length > 0) {
                    classes.forEach(function(order) {
                        data.push([order.name, order.gradeName, order.subjectName, order.categoryName, order.schoolArea, order.enrollCount, order.totalStudentCount]);
                    });
                    var buffer = xlsx.build([{ name: "课程", data: data }]),
                        fileName = '课程报名情况' + '.xlsx';
                    fs.writeFileSync(path.join(serverPath, "../../public/downloads/", fileName), buffer, 'binary');
                    res.jsonp({ sucess: true });
                }
            });
    });
}