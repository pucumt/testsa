var AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
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
                        trains.forEach(function(train) {
                            orders.push({
                                studentName: student.name,
                                _id: train._id,
                                className: train.examName,
                                orderDate: train.orderDate,
                                score: train.score
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
}