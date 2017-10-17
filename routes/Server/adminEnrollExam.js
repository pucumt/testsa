var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    AdminEnrollExam = model.adminEnrollExam,
    AdminEnrollExamScore = model.adminEnrollExamScore,
    ExamClass = model.examClass,
    StudentInfo = model.studentInfo,
    StudentAccount = model.studentAccount,
    ClassRoom = model.classRoom,
    ExamClassExamArea = model.examClassExamArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/adminEnrollExamList', checkLogin);
    app.get('/admin/adminEnrollExamList', auth.checkSecure);
    app.get('/admin/adminEnrollExamList', function (req, res) {
        res.render('Server/adminEnrollExamList.html', {
            title: '>测试报名',
            user: req.session.admin
        });
    });

    app.get('/admin/examOrderList', checkLogin);
    app.get('/admin/examOrderList', function (req, res) {
        res.render('Server/examOrderList.html', {
            title: '>测试订单',
            user: req.session.admin
        });
    });

    app.get('/admin/cardSearch', checkLogin);
    app.get('/admin/cardSearch', function (req, res) {
        res.render('Server/cardSearch.html', {
            title: '>准考证查询',
            user: req.session.admin
        });
    });

    app.get('/admin/ScoreInput', checkLogin);
    app.get('/admin/ScoreInput', function (req, res) {
        res.render('Server/ScoreInput.html', {
            title: '>成绩录入',
            user: req.session.admin
        });
    });

    app.post('/admin/adminEnrollExam/search', checkLogin);
    app.post('/admin/adminEnrollExam/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentName && req.body.studentName.trim()) {
            filter.studentName = {
                $like: `%${req.body.studentName.trim()}%`
            };
        }
        if (req.body.className && req.body.className.trim()) {
            filter.examName = {
                $like: `%${req.body.className.trim()}%`
            };
        }
        if (req.body.isSucceed) {
            filter.isSucceed = req.body.isSucceed;
        }
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
        }
        AdminEnrollExam.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                adminEnrollExams: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    // 准考证查询，暂时没用到
    app.post('/admin/adminEnrollExam/searchCard', checkLogin);
    app.post('/admin/adminEnrollExam/searchCard', function (req, res) {
        var filter = {},
            pAccount = Promise.resolve();
        if (req.body.mobile) {
            pAccount = StudentAccount.getFilter({
                name: req.body.mobile
            });
        }
        pAccount.then(function (account) {
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
                return StudentInfo.getFilters(filter).then(function (students) {
                    if (students.length > 0) {
                        var ids = students.map(function (student) {
                            return student._id;
                        });
                        return AdminEnrollExam.getAllWithoutPaging({
                                studentId: {
                                    $in: ids
                                },
                                isSucceed: 1
                            })
                            .then(function (adminEnrollExams) {
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

    //examClassExamAreaId: examArea
    app.post('/admin/adminEnrollExam/enroll2', checkLogin);
    app.post('/admin/adminEnrollExam/enroll2', function (req, res) {
        model.db.sequelize.query("select 1 from adminEnrollExams O join examClasss C \
                on C._id=:id and C.isDeleted=false and O.examCategoryId=C.examCategoryId where O.studentId=:studentId and O.isDeleted=false", {
                replacements: {
                    id: req.body.examId,
                    studentId: req.body.studentId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(orders => {
                if (orders.length > 0) {
                    res.jsonp({
                        error: "你已经报过名了，此课程不允许多次报名"
                    });
                    return;
                }

                ExamClassExamArea.getFilter({
                        _id: req.body.examClassExamAreaId
                    })
                    .then(examClassExamArea => {
                        // 1. 更新报名考场名额
                        // 2. 更新总考试名额
                        // 3. 插入订单
                        model.db.sequelize.transaction(function (t1) {
                            return ExamClassExamArea.update({
                                    enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                }, {
                                    where: {
                                        _id: req.body.examClassExamAreaId,
                                        'enrollCount': model.db.sequelize.literal('`enrollCount`<`examCount`')
                                    },
                                    transaction: t1
                                })
                                .then(function (resultArea) {
                                    if (resultArea.length && resultArea[0]) {
                                        // 必须操作成功
                                        return ExamClass.update({
                                                enrollCount: model.db.sequelize.literal('`enrollCount` +1')
                                            }, {
                                                where: {
                                                    _id: req.body.examId
                                                },
                                                transaction: t1
                                            })
                                            .then(function () {
                                                return AdminEnrollExam.create({
                                                    studentId: req.body.studentId,
                                                    studentName: req.body.studentName,
                                                    mobile: req.body.mobile,
                                                    examId: req.body.examId,
                                                    examName: req.body.examName,
                                                    examCategoryId: req.body.examCategoryId,
                                                    examCategoryName: req.body.examCategoryName,
                                                    examAreaId: examClassExamArea.examAreaId,
                                                    examAreaName: examClassExamArea.examAreaName
                                                }, {
                                                    transaction: t1
                                                });
                                            });
                                    } else {
                                        return {
                                            error: "已经报满了"
                                        };
                                    }
                                });
                        }).then(function (result) {
                            if (result.error) {
                                res.jsonp(result);
                                return;
                            }
                            res.jsonp({
                                sucess: true
                            });
                        }).catch(function () {
                            res.jsonp({
                                error: "报名失败"
                            });
                        });
                    });
            });
    });

    app.post('/admin/adminEnrollExam/hideEnroll', checkLogin);
    app.post('/admin/adminEnrollExam/hideEnroll', function (req, res) {
        model.db.sequelize.query("select 1 from adminEnrollExams O join examClasss C \
        on C._id=:id and C.isDeleted=false and O.examCategoryId=C.examCategoryId where O.studentId=:studentId and O.isDeleted=false", {
                replacements: {
                    id: req.body.examId,
                    studentId: req.body.studentId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(orders => {
                if (orders.length > 0) {
                    res.jsonp({
                        error: "你已经报过名了，此课程不允许多次报名"
                    });
                    return;
                }

                ExamClassExamArea.getFilter({
                        _id: req.body.examClassExamAreaId
                    })
                    .then(examClassExamArea => {
                        // 直接插入订单，不更改名额
                        return AdminEnrollExam.create({
                            studentId: req.body.studentId,
                            studentName: req.body.studentName,
                            mobile: req.body.mobile,
                            examId: req.body.examId,
                            examName: req.body.examName,
                            isHide: true,
                            examCategoryId: req.body.examCategoryId,
                            examCategoryName: req.body.examCategoryName,
                            examAreaId: examClassExamArea.examAreaId,
                            examAreaName: examClassExamArea.examAreaName
                        }).then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        }).catch(function () {
                            res.jsonp({
                                error: "报名失败"
                            });
                        });
                    });
            });
    });

    app.post('/admin/adminEnrollExam/cancel', checkLogin);
    app.post('/admin/adminEnrollExam/cancel', function (req, res) {
        // 1. cancel exam area relation count
        // 2. cancel examclass count
        // 3. cancel exam order
        model.db.sequelize.transaction(function (t1) {
            return ExamClassExamArea.update({
                    enrollCount: model.db.sequelize.literal('`enrollCount` -1')
                }, {
                    where: {
                        examId: req.body.examId,
                        examAreaId: req.body.examAreaId,
                        isDeleted: false
                    },
                    transaction: t1
                })
                .then(function () {
                    return ExamClass.update({
                            enrollCount: model.db.sequelize.literal('`enrollCount` -1')
                        }, {
                            where: {
                                _id: req.body.examId
                            },
                            transaction: t1
                        })
                        .then(function () {
                            return AdminEnrollExam.update({
                                isDeleted: true,
                                deletedBy: req.session.admin._id,
                                deletedDate: new Date()
                            }, {
                                where: {
                                    _id: req.body.id
                                },
                                transaction: t1
                            });
                        });
                });
        }).then(function () {
            res.jsonp({
                sucess: true
            });
        }).catch(function () {
            res.jsonp({
                error: "取消失败"
            });
        });
    });

    app.post('/admin/adminEnrollExam/changeStudent', checkLogin);
    app.post('/admin/adminEnrollExam/changeStudent', function (req, res) {
        AdminEnrollExam.update({
                studentId: req.body.studentId,
                studentName: req.body.studentName
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/adminEnrollExam/searchExamScore', checkLogin);
    app.post('/admin/adminEnrollExam/searchExamScore', function (req, res) {
        model.db.sequelize.query("select C.examDate, C.examTime, O.* from adminEnrollExams O left join examClasss C on O.examId=C._id where \
        O._id=:id and C.isDeleted=false", {
                replacements: {
                    id: req.body.id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(results => {
                var exam = results[0];
                AdminEnrollExamScore.getFilters({
                        examOrderId: exam._id
                    })
                    .then(scores => {
                        exam.scores = scores;
                        res.jsonp(exam);
                    });
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