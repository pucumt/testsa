var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    AdminEnrollExam = model.adminEnrollExam,
    AdminEnrollExamHistory = model.adminEnrollExamHistory,
    AdminEnrollExamScore = model.adminEnrollExamScore,
    RebateEnrollExam = model.rebateEnrollExam,
    ExamClass = model.examClass,
    StudentInfo = model.studentInfo,
    StudentAccount = model.studentAccount,
    ClassRoom = model.classRoom,
    ExamClassExamArea = model.examClassExamArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/adminEnrollExamList', checkLogin);
    app.get('/admin/adminEnrollExamList', auth.checkSecure([0, 3, 7, 8]));
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

    app.get('/admin/examOrderList/id/:id', checkLogin);
    app.get('/admin/examOrderList/id/:id', function (req, res) {
        res.render('Server/examOrderList.html', {
            title: '>课程订单',
            user: req.session.admin,
            orderId: req.params.id
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

    app.get('/admin/payexam/:id', checkLogin);
    app.get('/admin/payexam/:id', function (req, res) {
        AdminEnrollExam.getFilter({
                _id: req.params.id
            })
            .then(function (examOrder) {
                res.render('Server/payExam.html', {
                    title: '>订单支付',
                    user: req.session.admin,
                    examOrder: examOrder
                });
            });
    });

    app.get('/admin/rebateExamOrderList', checkLogin);
    app.get('/admin/rebateExamOrderList', function (req, res) {
        res.render('Server/rebateExamOrderList.html', {
            title: '>退费管理',
            user: req.session.admin
        });
    });

    app.get('/admin/paywayExamOrderList', checkLogin);
    app.get('/admin/paywayExamOrderList', function (req, res) {
        res.render('Server/paywayExamOrderList.html', {
            title: '>支付方式修改',
            user: req.session.admin
        });
    });

    app.get('/admin/rebatewayExamOrderList', checkLogin);
    app.get('/admin/rebatewayExamOrderList', function (req, res) {
        res.render('Server/rebatewayExamOrderList.html', {
            title: '>退款方式修改',
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
        if (req.body.orderId) {
            filter._id = req.body.orderId;
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

    app.post('/admin/adminEnrollExam/searchPayed', checkLogin);
    app.post('/admin/adminEnrollExam/searchPayed', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            isSucceed: 1,
            isPayed: true
        };
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

    app.post('/admin/adminEnrollExam/changePayway', checkLogin);
    app.post('/admin/adminEnrollExam/changePayway', function (req, res) {
        AdminEnrollExam.getFilter({
            _id: req.body.id
        }).then(function (order) {
            var history = {
                examOrderId: req.body.id,
                createdBy: req.session.admin._id,
                payWay: order.payWay,
                comment: "修改支付方式"
            };
            // 1. 生成历史记录
            // 2. 更新订单
            model.db.sequelize.transaction(function (t1) {
                return AdminEnrollExamHistory.create(history, {
                        transaction: t1
                    })
                    .then(function (resultArea) {
                        return AdminEnrollExam.update({
                            payWay: req.body.payWay
                        }, {
                            where: {
                                _id: req.body.id
                            },
                            transaction: t1
                        });
                    });
            }).then(function (result) {
                res.jsonp({
                    sucess: true
                });
            }).catch(function () {
                res.jsonp({
                    error: "修改失败"
                });
            });
        });
    });

    // 退款
    app.post('/admin/adminEnrollExam/rebate', checkLogin);
    app.post('/admin/adminEnrollExam/rebate', function (req, res) {
        var price = parseFloat(req.body.price);

        model.db.sequelize.transaction(function (t1) {
            // 订单退款
            return AdminEnrollExam.update({
                rebatePrice: model.db.sequelize.literal('`rebatePrice`+' + (price)),
                payPrice: model.db.sequelize.literal('`payPrice`-' + price),
                comment: req.body.comment
            }, {
                where: {
                    _id: req.body.Id
                },
                transaction: t1
            }).then(result => {
                // 保存退款记录
                return RebateEnrollExam.create({
                    examOrderId: req.body.Id,
                    originalPrice: req.body.originalPrice,
                    rebatePrice: req.body.price,
                    rebateWay: req.body.payWay,
                    comment: req.body.comment,
                    createdBy: req.session.admin._id
                }, {
                    transaction: t1
                });
            });
        }).then(function () {
            res.jsonp({
                sucess: true
            });
        }).catch(function () {
            res.jsonp({
                error: "退费失败"
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
    app.post('/admin/adminEnrollExam/enroll', checkLogin);
    app.post('/admin/adminEnrollExam/enroll', function (req, res) {
        ExamClass.getFilter({
                _id: req.body.examId
            })
            .then(function (examclass) {
                var strQuery = "select count(0) as count from adminEnrollExams \
                        where isDeleted=false and isSucceed=1 and studentId=:studentId ";
                if (examclass.examCategoryId) {
                    strQuery += " and examCategoryId=:examCategoryId ";
                } else {
                    strQuery += " and examId=:examId ";
                }
                model.db.sequelize.query(strQuery, {
                        replacements: {
                            studentId: req.body.studentId,
                            examCategoryId: examclass.examCategoryId,
                            examId: examclass._id
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (result) {
                        if (result && result[0] && result[0].count) {
                            // 已经报过名了
                            res.jsonp({
                                error: "你已经报过名了，此测试不允许多次报名"
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
                                                            examPrice: examclass.examPrice,
                                                            payPrice: examclass.examPrice,
                                                            examCategoryId: req.body.examCategoryId,
                                                            examCategoryName: req.body.examCategoryName,
                                                            examAreaId: examClassExamArea.examAreaId,
                                                            examAreaName: examClassExamArea.examAreaName,
                                                            createdBy: req.session.admin._id
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
                                        orderId: result.payPrice && result._id,
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
    });

    app.post('/admin/adminEnrollExam/hideEnroll', checkLogin);
    app.post('/admin/adminEnrollExam/hideEnroll', function (req, res) {
        ExamClass.getFilter({
                _id: req.body.examId
            })
            .then(function (examclass) {
                var strQuery = "select count(0) as count from adminEnrollExams \
                        where isDeleted=false and isSucceed=1 and studentId=:studentId ";
                if (examclass.examCategoryId) {
                    strQuery += " and examCategoryId=:examCategoryId ";
                } else {
                    strQuery += " and examId=:examId ";
                }
                model.db.sequelize.query(strQuery, {
                        replacements: {
                            studentId: req.body.studentId,
                            examCategoryId: examclass.examCategoryId,
                            examId: examclass._id
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (result) {
                        if (result && result[0] && result[0].count) {
                            // 已经报过名了
                            res.jsonp({
                                error: "你已经报过名了，此测试不允许多次报名"
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
                                    examPrice: examclass.examPrice,
                                    payPrice: examclass.examPrice,
                                    isHide: true,
                                    examCategoryId: req.body.examCategoryId,
                                    examCategoryName: req.body.examCategoryName,
                                    examAreaId: examClassExamArea.examAreaId,
                                    examAreaName: examClassExamArea.examAreaName,
                                    createdBy: req.session.admin._id
                                }).then(function (order) {
                                    res.jsonp({
                                        orderId: order.payPrice && order._id,
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
                            var curDate = new Date();
                            return AdminEnrollExam.update({
                                isSucceed: 9,
                                deletedBy: req.session.admin._id,
                                updatedDate: curDate,
                                deletedDate: curDate
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

    app.post('/admin/adminEnrollExam/pay', checkLogin);
    app.post('/admin/adminEnrollExam/pay', function (req, res) {
        AdminEnrollExam.update({
                isPayed: true,
                payWay: req.body.payWay
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            }).catch(function () {
                res.jsonp({
                    error: "付款失败"
                });
            });
    });

    // 生成考试号
    app.post('/admin/examClass/generateExamNumber', checkLogin);
    app.post('/admin/examClass/generateExamNumber', function (req, res) {
        // ExamClassExamArea.getFilters({})
        //     .then(function (examClassExamAreas) {
        AdminEnrollExam.getFilters({
                examId: req.body.id
            })
            .then(function (orders) {
                var i = 0,
                    areaJson = {};
                orders.sort(function (orderA, orderB) {
                        return orderA.examAreaId > orderB.examAreaId;
                    })
                    .forEach(function (order) {
                        i++;
                        order.update({
                            examNum: i
                        });
                    });
                res.jsonp({
                    sucess: true
                });
            });
        // });
    });

    function isEmptyObject(e) {
        var t;
        for (t in e) {
            return false;
        }
        return true;
    };
}