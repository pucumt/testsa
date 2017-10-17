var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    AdminEnrollExam = model.adminEnrollExam,
    AdminEnrollTrain = model.adminEnrollTrain,
    ExamClassExamArea = model.examClassExamArea,
    TrainClass = model.trainClass,
    ExamClass = model.examClass,
    StudentInfo = model.studentInfo,
    ClassRoom = model.classRoom,
    payHelper = require('../../util/payHelper.js'),
    ChangeEnd = model.changeEnd,
    auth = require("./auth"),
    moment = require("moment"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function (app) {
    app.post('/personalCenter/order/all', checkJSONLogin);
    app.post('/personalCenter/order/all', function (req, res) {
        var currentUser = req.session.user;
        ChangeEnd.getFilter({})
            .then(function (changeEnd) {
                return model.db.sequelize.query("select O.studentId, O.studentName, O._id, O.isPayed, O.trainName as className,\
                        O.totalPrice, O.realMaterialPrice, O.createdDate, C.courseTime, C.bookId, C.minLesson, C.maxLesson, C.courseStartDate\
                        from studentInfos S join adminEnrollTrains O \
                        on S._id=O.studentId and O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId \
                        join trainClasss C on O.trainId=C._id where S.isDeleted=false and S.accountId=:accountId", {
                        replacements: {
                            yearId: global.currentYear._id,
                            accountId: currentUser._id
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (orders) {
                        if (changeEnd && changeEnd.endDate) {
                            orders.forEach(function (order) {
                                order.courseStartDate = changeEnd.endDate;
                            });
                        }
                        res.jsonp(orders);
                    });
            });
    });

    // TBD need test the function
    app.post('/personalCenter/exam/all', checkJSONLogin);
    app.post('/personalCenter/exam/all', function (req, res) {
        var currentUser = req.session.user;
        return model.db.sequelize.query("select O.studentName, O._id, O.examName as className,\
                     O.createdDate, C.examDate\
                    from studentInfos S join adminEnrollExams O \
                    on S._id=O.studentId and O.isDeleted=false and O.isSucceed=1 \
                    join examClasss C on O.examId=C._id where S.isDeleted=false and S.accountId=:accountId", {
                replacements: {
                    yearId: global.currentYear._id,
                    accountId: currentUser._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (orders) {
                res.jsonp(orders);
            });
    });

    app.get('/personalCenter/order/id/:id', checkLogin);
    app.get('/personalCenter/order/id/:id', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.params.id
            })
            .then(function (order) {
                if (order) {
                    TrainClass.getFilter({
                            _id: order.trainId
                        })
                        .then(function (train) {
                            if (train) {
                                res.render('Client/personalCenter_order_detail.html', {
                                    title: '测试列表',
                                    user: req.session.user,
                                    order: order,
                                    train: train
                                });
                            }
                        })
                }
            });
    });

    app.get('/personalCenter/changeClass/id/:id', checkLogin);
    app.get('/personalCenter/changeClass/id/:id', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.params.id
            })
            .then(function (order) {
                if (order) {
                    TrainClass.getFilter({
                            _id: order.trainId
                        })
                        .then(function (train) {
                            if (train) {
                                res.render('Client/personalCenter_order_changeClass.html', {
                                    title: '调班',
                                    user: req.session.user,
                                    order: order,
                                    train: train
                                });
                            }
                        })
                }
            });
    });

    app.get('/personalCenter/exam/id/:id', checkLogin);
    app.get('/personalCenter/exam/id/:id', function (req, res) {
        AdminEnrollExam.getFilter({
                _id: req.params.id
            })
            .then(function (order) {
                if (order) {
                    ExamClass.getFilter({
                            _id: order.examId
                        })
                        .then(function (train) {
                            if (train) {
                                if (order.classRoomId) {
                                    ClassRoom.getFilter({
                                            _id: order.classRoomId
                                        })
                                        .then(function (classRoom) {
                                            res.render('Client/personalCenter_exam_detail.html', {
                                                title: '测试列表',
                                                user: req.session.user,
                                                order: order,
                                                train: train,
                                                classRoom: classRoom
                                            });
                                        })
                                } else {
                                    res.render('Client/personalCenter_exam_detail.html', {
                                        title: '测试列表',
                                        user: req.session.user,
                                        order: order,
                                        train: train
                                    });
                                }
                            }
                        })
                }
            });
    });

    app.get('/personalCenter/order/wechatpay/:id', checkLogin);
    app.get('/personalCenter/order/wechatpay/:id', function (req, res) {
        if (req.params.id) {
            payHelper.getOpenId(res, req.params.id);
            //openWechatPay(res, req.params.id, "o1ykmwwG2MbGSLMRuDYItN65kpQ0");
        }
    });
    app.get('/personalCenter/order/zhifubaopay/:id', checkLogin);
    app.get('/personalCenter/order/zhifubaopay/:id', function (req, res) {
        debugger;
        if (req.params.id) {
            openzhifubaoPay(res, req.params.id, "o1ykmwwG2MbGSLMRuDYItN65kpQ0");
        }
    });
    app.get('/personalCenter/order/pay/:id', checkLogin);
    app.get('/personalCenter/order/pay/:id', function (req, res) {
        debugger;
        if (req.params.id) {
            payHelper.getOpenId(res, req.params.id);
        }
        // openWechatPay(res, req.params.id, "o1ykmwwG2MbGSLMRuDYItN65kpQ0");
    });

    function opennativeWechatPay(res, id, openId) {
        debugger;
        AdminEnrollTrain.getFilter({
                _id: id
            })
            .then(function (order) {
                if (order) {
                    var payParas = {
                        out_trade_no: order._id,
                        body: order.trainName,
                        total_fee: ((parseFloat(order.totalPrice) || 0) + (parseFloat(order.realMaterialPrice) || 0)) * 100,
                        openId: openId,
                        time_expire: moment().add(20, 'minute').format("YYYYMMDDHHmmss")
                    };
                    //time_expire is new function, maybe there is something wrong
                    payHelper.jsPay(payParas, res);
                }
            });
    };

    function openWechatPay(res, id, openId) {
        debugger;
        AdminEnrollTrain.getFilter({
                _id: id
            })
            .then(function (order) {
                if (order) {
                    var payParas = {
                        out_trade_no: order._id,
                        body: order.trainName,
                        total_fee: ((parseFloat(order.totalPrice) || 0) + (parseFloat(order.realMaterialPrice) || 0)) * 100,
                        openId: openId
                    };
                    payHelper.pay(payParas, res);
                }
            });
    };

    function openzhifubaoPay(res, id, openId) {
        debugger;
        AdminEnrollTrain.getFilter({
                _id: id
            })
            .then(function (order) {
                if (order) {
                    var payParas = {
                        out_trade_no: order._id,
                        body: order.trainName,
                        total_fee: ((parseFloat(order.totalPrice) || 0) + (parseFloat(order.realMaterialPrice) || 0)) * 100,
                        openId: openId
                    };
                    payHelper.aliPay(payParas, res);
                }
            });
    };

    app.get('/get_wx_access_token/:id', function (req, res) {
        debugger;
        payHelper.wechatPay(req, res, opennativeWechatPay);
    });

    // 取消测试订单
    app.post('/cancel/exam', checkJSONLogin);
    app.post('/cancel/exam', function (req, res) {
        // 1. 增加此考场的名额
        // 2. 增加此次考试的名额
        // 3. 取消此次考试订单
        AdminEnrollExam.getFilter({
                _id: req.body.id
            })
            .then(function (order) {
                if (order) {
                    model.db.sequelize.transaction(function (t1) {
                        return ExamClassExamArea.update({
                                enrollCount: model.db.sequelize.literal('`enrollCount` -1')
                            }, {
                                where: {
                                    examId: order.examId,
                                    examAreaId: order.examAreaId,
                                    isDeleted: false
                                },
                                transaction: t1
                            })
                            .then(function () {
                                return ExamClass.update({
                                        enrollCount: model.db.sequelize.literal('`enrollCount` -1')
                                    }, {
                                        where: {
                                            _id: order.examId
                                        },
                                        transaction: t1
                                    })
                                    .then(function () {
                                        return AdminEnrollExam.update({
                                            isDeleted: true,
                                            deletedBy: req.session.user._id,
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
                }
            });
    });
}