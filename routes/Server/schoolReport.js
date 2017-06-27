var AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    SchoolArea = require('../../models/schoolArea.js'),
    TrainClass = require('../../models/trainClass.js'),
    Subject = require('../../models/subject.js'),
    Year = require('../../models/year.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/schoolReportList', checkLogin);
    app.get('/admin/schoolReportList', function(req, res) {
        res.render('Server/schoolReportList.html', {
            title: '>校区金额报表',
            user: req.session.admin
        });
    });

    app.get('/admin/payWayReportList', checkLogin);
    app.get('/admin/payWayReportList', function(req, res) {
        res.render('Server/payWayReportList.html', {
            title: '>支付方式报表',
            user: req.session.admin
        });
    });

    app.get('/admin/rebateReportList', checkLogin);
    app.get('/admin/rebateReportList', function(req, res) {
        res.render('Server/rebateReportList.html', {
            title: '>退费报表',
            user: req.session.admin
        });
    });

    app.get('/admin/peopleCountList', checkLogin);
    app.get('/admin/peopleCountList', function(req, res) {
        res.render('Server/peopleCountList.html', {
            title: '>人数统计',
            user: req.session.admin
        });
    });

    app.get('/admin/gradeMOneList', checkLogin);
    app.get('/admin/gradeMOneList', function(req, res) {
        res.render('Server/gradeMOneList.html', {
            title: '>小升初报名情况',
            user: req.session.admin
        });
    });

    app.get('/admin/compareLastList', checkLogin);
    app.get('/admin/compareLastList', function(req, res) {
        res.render('Server/compareLastList.html', {
            title: '>留存报表',
            user: req.session.admin
        });
    });

    app.post('/admin/schoolReportList/search', checkLogin);
    app.post('/admin/schoolReportList/search', function(req, res) {
        var list = [];
        AdminEnrollTrain.getSchoolReportList(global.currentYear._id, req.body.startDate, req.body.endDate)
            .then(function(orders) {
                orders.forEach(function(order) {
                    list.push({
                        _id: order._id.schoolId,
                        name: order._id.schoolArea,
                        trainPrice: order.trainPrice.toFixed(2),
                        materialPrice: order.materialPrice.toFixed(2),
                        totalPrice: (order.trainPrice + order.materialPrice).toFixed(2)
                    });
                });
                res.json(list.sort(function(a, b) {
                    return a.name < b.name;
                }));
            });
    });

    app.post('/admin/payWayReportList/search', checkLogin);
    app.post('/admin/payWayReportList/search', function(req, res) {
        var list = [];

        function getPayWay(way) {
            switch (way) {
                case 0:
                    return "现金";
                case 1:
                    return "刷卡";
                case 2:
                    return "转账";
                case 8:
                    return "支付宝扫码";
                case 9:
                    return "微信扫码";
                case 6:
                    return "在线支付";
                default:
                    return "No payWay";
            }
        }
        AdminEnrollTrain.getPayWayReportList(global.currentYear._id, req.body.startDate, req.body.endDate, req.body.schoolId)
            .then(function(orders) {
                orders.forEach(function(order) {
                    list.push({
                        name: getPayWay(order._id),
                        trainPrice: order.trainPrice.toFixed(2),
                        materialPrice: order.materialPrice.toFixed(2),
                        totalPrice: (order.trainPrice + order.materialPrice).toFixed(2)
                    });
                });
                res.json(list.sort(function(a, b) {
                    return a.name < b.name;
                }));
            });
    });

    app.post('/admin/rebateReportList/search', checkLogin);
    app.post('/admin/rebateReportList/search', function(req, res) {
        var list = [];
        Subject.getFilters({}).then(function(subjects) {
            var pArray = [];
            subjects.forEach(function(subject) {
                var p = TrainClass.getFilters({ schoolId: req.body.schoolId, subjectId: subject._id })
                    .then(function(trainClasses) {
                        if (trainClasses && trainClasses.length > 0) {
                            var classIds = trainClasses.map(function(singleClass) {
                                return singleClass._id;
                            });
                            return AdminEnrollTrain.getFilters({
                                trainId: { $in: classIds },
                                orderDate: { $lte: req.body.endDate },
                                orderDate: { $gte: req.body.startDate },
                                isPayed: true
                            }).then(function(orders) {
                                var rebatePrice = 0;
                                orders.forEach(function(order) {
                                    rebatePrice = rebatePrice + order.rebatePrice;
                                });

                                list.push({
                                    _id: subject._id,
                                    name: subject.name,
                                    rebatePrice: rebatePrice.toFixed(2)
                                });
                            });
                        } else {
                            list.push({ _id: subject._id, name: subject.name, rebatePrice: 0 });
                        }
                    });
                pArray.push(p);
            });
            Promise.all(pArray).then(function() {
                res.json(list);
            });
        });
    });

    app.post('/admin/peopleCountList/search', checkLogin);
    app.post('/admin/peopleCountList/search', function(req, res) {
        var list = [],
            filter = {
                schoolId: req.body.schoolId,
                yearId: global.currentYear._id
            };
        if (req.body.gradeId && req.body.gradeId != '[""]') {
            filter.gradeId = { $in: JSON.parse(req.body.gradeId) };
        }

        if (req.body.subjectId) {
            filter.subjectId = req.body.subjectId;
        }

        if (req.body.categoryId) {
            filter.categoryId = req.body.categoryId;
        }
        TrainClass.getFilters(filter)
            .then(function(trainClasses) {
                if (trainClasses && trainClasses.length > 0) {
                    var totalEnrollCount = 0;
                    trainClasses.forEach(function(trainClass) {
                        totalEnrollCount += trainClass.enrollCount;
                        list.push({
                            _id: trainClass._id,
                            name: trainClass.name,
                            enrollCount: trainClass.enrollCount,
                            totalStudentCount: trainClass.totalStudentCount
                        });
                    });
                    list.push({
                        _id: "",
                        name: "总报名人数",
                        enrollCount: totalEnrollCount,
                        totalStudentCount: ""
                    });
                }
                res.json(list);
            });
    });

    app.post('/admin/compareLastList/search', checkLogin);
    app.post('/admin/compareLastList/search', function(req, res) {
        Year.getFilter({ sequence: (global.currentYear.sequence - 1) })
            .then(function(year) {
                if (year) {
                    var list = [],
                        filter = {
                            schoolId: req.body.schoolId,
                            yearId: year._id
                        };
                    if (req.body.gradeId) {
                        filter.gradeId = req.body.gradeId;
                    }

                    if (req.body.subjectId) {
                        filter.subjectId = req.body.subjectId;
                    }

                    if (req.body.name) {
                        var reg = new RegExp(req.body.name, 'i')
                        filter.name = {
                            $regex: reg
                        };
                    }
                    TrainClass.getFilters(filter)
                        .then(function(trainClasses) {
                            var pArray = [];
                            if (trainClasses && trainClasses.length > 0) {
                                trainClasses.forEach(function(trainClass) {
                                    var p = AdminEnrollTrain.getFilters({
                                            trainId: trainClass._id,
                                            isSucceed: 1
                                        })
                                        .then(function(orders) {
                                            if (orders && orders.length > 0) {
                                                var studentIds = orders.map(function(order) {
                                                    return order.studentId;
                                                });
                                                return TrainClass.getFilters({
                                                        yearId: global.currentYear._id,
                                                        subjectId: trainClass.subjectId
                                                    })
                                                    .then(function(newClasses) {
                                                        if (newClasses && newClasses.length > 0) {
                                                            var newClassIds = newClasses.map(function(newClass) {
                                                                return newClass._id;
                                                            });
                                                            return AdminEnrollTrain.getCount({
                                                                    trainId: { $in: newClassIds },
                                                                    studentId: { $in: studentIds },
                                                                    yearId: global.currentYear._id,
                                                                    isSucceed: 1
                                                                })
                                                                .then(function(count) {
                                                                    list.push({
                                                                        _id: trainClass._id,
                                                                        name: trainClass.name,
                                                                        gradeName: trainClass.gradeName,
                                                                        teacherName: trainClass.teacherName,
                                                                        originalCount: orders.length,
                                                                        enrollCount: count,
                                                                        enrollRatio: (orders.length > 0 ? (count * 100 / orders.length).toFixed(2) : 0)
                                                                    });
                                                                });
                                                        } else {
                                                            list.push({
                                                                _id: trainClass._id,
                                                                name: trainClass.name,
                                                                teacherName: "没找到对应新课程",
                                                                originalCount: 0,
                                                                enrollCount: 0,
                                                                enrollRatio: 0
                                                            });
                                                        }
                                                    });
                                            } else {
                                                list.push({
                                                    _id: trainClass._id,
                                                    name: trainClass.name,
                                                    teacherName: "没找到学生",
                                                    originalCount: 0,
                                                    enrollCount: 0,
                                                    enrollRatio: 0
                                                });
                                            }

                                        });
                                    pArray.push(p);
                                });
                            }
                            Promise.all(pArray).then(function() {
                                res.json(list);
                            });
                        });
                }
            });
    });

    app.get('/admin/enrollAggregateList', checkLogin);
    app.get('/admin/enrollAggregateList', function(req, res) {
        res.render('Server/enrollAggregateList.html', {
            title: '>报名情况统计',
            user: req.session.admin
        });
    });

    app.get('/admin/otherReportList', checkLogin);
    app.get('/admin/otherReportList', function(req, res) {
        res.render('Server/otherReportList.html', {
            title: '>其他报表情况',
            user: req.session.admin
        });
    });

    app.post('/admin/enrollAggregateList/search', checkLogin);
    app.post('/admin/enrollAggregateList/search', function(req, res) {
        var list = [],
            filter = {
                yearId: global.currentYear._id
            };
        if (req.body.gradeId) {
            filter.gradeId = req.body.gradeId;
        }
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }

        TrainClass.getFilters(filter)
            .then(function(trainClasses) {
                var pArray = [];
                if (trainClasses && trainClasses.length > 0) {
                    var ids = trainClasses.map(function(trainClass) {
                        return trainClass._id.toJSON();
                    });

                    var p0 = AdminEnrollTrain.getOrderCount({
                            trainId: { $in: ids },
                            yearId: global.currentYear._id,
                            isSucceed: 1
                        })
                        .then(function(count) {
                            list.push({ name: "总订单", value: count });
                        });
                    pArray.push(p0);

                    var p1 = AdminEnrollTrain.getStudentwithOrderCount({
                            trainId: { $in: ids },
                            yearId: global.currentYear._id.toJSON(),
                            isSucceed: 1
                        })
                        .then(function(aggs) {
                            if (aggs && aggs.length > 0) {
                                list.push({ name: "下单总人数", value: aggs[0].count });
                            }
                        });
                    pArray.push(p1);

                    var p2 = AdminEnrollTrain.getStudent2OrderMore({
                            trainId: { $in: ids },
                            yearId: global.currentYear._id.toJSON(),
                            isSucceed: 1
                        })
                        .then(function(aggs) {
                            if (aggs && aggs.length > 0) {
                                list.push({ name: "连报2门以上", value: aggs[0].count });
                            }
                        });
                    pArray.push(p2);

                    var p3 = AdminEnrollTrain.getStudent3OrderMore({
                            trainId: { $in: ids },
                            yearId: global.currentYear._id.toJSON(),
                            isSucceed: 1
                        })
                        .then(function(aggs) {
                            if (aggs && aggs.length > 0) {
                                list.push({ name: "连报3门以上", value: aggs[0].count });
                            }
                        });
                    pArray.push(p3);

                    var p4 = AdminEnrollTrain.getStudent4OrderMore({
                            trainId: { $in: ids },
                            yearId: global.currentYear._id.toJSON(),
                            isSucceed: 1
                        })
                        .then(function(aggs) {
                            if (aggs && aggs.length > 0) {
                                list.push({ name: "连报4门以上", value: aggs[0].count });
                            }
                        });
                    pArray.push(p4);

                    var p5 = AdminEnrollTrain.getStudent5OrderMore({
                            trainId: { $in: ids },
                            yearId: global.currentYear._id.toJSON(),
                            isSucceed: 1
                        })
                        .then(function(aggs) {
                            if (aggs && aggs.length > 0) {
                                list.push({ name: "连报5门以上", value: aggs[0].count });
                            }
                        });
                    pArray.push(p5);
                }
                Promise.all(pArray).then(function() {
                    res.json(list.sort(function(a, b) {
                        return a.name > b.name;
                    }));
                });
            });
    });
}