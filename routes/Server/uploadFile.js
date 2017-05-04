var xlsx = require("node-xlsx"),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    StudentAccount = require('../../models/studentAccount.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    ScoreFails = require('../../models/scoreFails.js'),
    AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    ExamClass = require('../../models/examClass.js'),
    auth = require("./auth"),
    archiver = require('archiver'),
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
            updateScore(list[0].data[i], req.body.examId, req.body.subject);
        }
        // res.redirect('/admin/score');
        res.jsonp({});
    });


    app.post('/admin/batchTrainClass', upload.single('avatar'), function(req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length;
        for (var i = 1; i < length; i++) {
            updateScore(list[0].data[i]);
        }
        res.jsonp({});
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


    //upload.single('report'), 
    app.post('/admin/report', upload.single('report'), function(req, res, next) {
        var fileNames = req.file.filename.split("_");
        updateReport(fileNames[0], fileNames[1], req.body.examId, req.body.subject, req.file.filename, res);

        //res.redirect('/admin/score');
    });

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
                fileName = req.body.exam + '_' + req.body.subject + '.xlsx';
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
                fileName = req.body.exam + '_' + req.body.subject + '.xlsx';
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
}