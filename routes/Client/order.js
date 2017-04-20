var AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    ExamClassExamArea = require('../../models/examClassExamArea.js'),
    TrainClass = require('../../models/trainClass.js'),
    ExamClass = require('../../models/examClass.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    ClassRoom = require('../../models/classRoom.js'),
    payHelper = require('../../util/payHelper.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function(app) {
    app.post('/personalCenter/order/all', checkJSONLogin);
    app.post('/personalCenter/order/all', function(req, res) {
        var currentUser = req.session.user;
        StudentInfo.getFilters({ accountId: currentUser._id }).then(function(students) {
            var orders = [],
                parray = [];
            students.forEach(function(student) {
                var filter = {
                    studentId: student._id,
                    isSucceed: 1
                };
                var p = AdminEnrollTrain.getFilters(filter)
                    .then(function(trains) {
                        trains.forEach(function(train) {
                            orders.push({
                                studentName: student.name,
                                _id: train._id,
                                isPayed: train.isPayed,
                                className: train.trainName,
                                totalPrice: train.totalPrice,
                                realMaterialPrice: train.realMaterialPrice,
                                orderDate: train.orderDate
                            });
                        });
                    });
                parray.push(p);
            });
            Promise.all(parray).then(function() {
                res.jsonp(orders);
                return;
            });
        });
    });

    app.post('/personalCenter/exam/all', checkJSONLogin);
    app.post('/personalCenter/exam/all', function(req, res) {
        var currentUser = req.session.user;
        StudentInfo.getFilters({ accountId: currentUser._id }).then(function(students) {
            var orders = [],
                parray = [];
            students.forEach(function(student) {
                var filter = {
                    studentId: student._id,
                    isSucceed: 1
                };
                var p = AdminEnrollExam.getFilters(filter)
                    .then(function(trains) {
                        var pChildArray = [];
                        trains.forEach(function(train) {
                            var pChild = ExamClass.get({ _id: train.examId })
                                .then(function(examClass) {
                                    orders.push({
                                        studentName: student.name,
                                        _id: train._id,
                                        className: train.examName,
                                        orderDate: train.orderDate,
                                        score: train.score,
                                        examDate: examClass.examDate
                                    });
                                });
                            pChildArray.push(pChild);
                        });
                        return Promise.all(pChildArray);
                    });
                parray.push(p);
            });
            Promise.all(parray).then(function() {
                res.jsonp(orders);
                return;
            });
        });
    });

    app.get('/personalCenter/order/id/:id', checkLogin);
    app.get('/personalCenter/order/id/:id', function(req, res) {
        AdminEnrollTrain.get(req.params.id).then(function(order) {
            if (order) {
                TrainClass.get(order.trainId).then(function(train) {
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

    app.get('/personalCenter/exam/id/:id', checkLogin);
    app.get('/personalCenter/exam/id/:id', function(req, res) {
        AdminEnrollExam.get(req.params.id).then(function(order) {
            if (order) {
                ExamClass.get(order.examId).then(function(train) {
                    if (train) {
                        if (order.classRoomId) {
                            ClassRoom.get(order.classRoomId).then(function(classRoom) {
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

    app.post('/personalCenter/order/pay', checkJSONLogin);
    app.post('/personalCenter/order/pay', function(req, res) {
        AdminEnrollTrain.get(req.body.id)
            .then(function(order) {
                if (order) {
                    var payParas = {
                        out_trade_no: order._id,
                        body: order.trainName,
                        total_fee: ((order.totalPrice || 0) + (order.realMaterialPrice || 0)) * 100
                    };
                    payHelper.jsPay(payParas, res);
                    return;
                }
                res.jsonp({ error: "生成付款码失败" });
            });
    });

    app.post('/cancel/exam', checkJSONLogin);
    app.post('/cancel/exam', function(req, res) {
        AdminEnrollExam.get(req.body.id).then(function(order) {
            if (order) {
                if (order.examAreaId) {
                    //multi
                    ExamClassExamArea.getFilter({ examId: order.examId, examAreaId: order.examAreaId })
                        .then(function(examClassExamArea) {
                            if (examClassExamArea) { //mult exam areas
                                ExamClassExamArea.cancel(examClassExamArea._id)
                                    .then(function(examClassExamAreaResult) {
                                        if (examClassExamAreaResult && examClassExamAreaResult.ok && examClassExamAreaResult.nModified == 1) {
                                            ExamClass.cancel2(order.examId).then(function(examClassResult) {
                                                if (examClassResult && examClassResult.ok && examClassResult.nModified == 1) {
                                                    AdminEnrollExam.cancel(req.body.id, function(err, adminEnrollExamResult) {
                                                        if (err) {
                                                            res.jsonp({ error: err });
                                                            return;
                                                        }
                                                        res.jsonp({ sucess: true });
                                                    });
                                                } else {
                                                    res.jsonp({ error: "取消总数失败" });
                                                    return;
                                                }
                                            });
                                        } else {
                                            res.jsonp({ error: "取消失败" });
                                            return;
                                        }
                                    });
                            }
                        });
                } else {
                    //old single exam area
                    ExamClass.cancel(order.examId)
                        .then(function(examClass) {
                            if (examClass && examClass.ok && examClass.nModified == 1) {
                                AdminEnrollExam.cancel(req.body.id, function(err, adminEnrollExam) {
                                    if (err) {
                                        res.jsonp({ error: err });
                                        return;
                                    }
                                    res.jsonp({ sucess: true });
                                });
                            } else {
                                res.jsonp({ error: "取消失败" });
                                return;
                            }
                        });
                }
            }
        });
    });
}