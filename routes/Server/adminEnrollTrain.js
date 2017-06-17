var AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    AdminEnrollTrainHistory = require('../../models/adminEnrollTrainHistory.js'),
    AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    TrainClass = require('../../models/trainClass.js'),
    RebateEnrollTrain = require('../../models/rebateEnrollTrain.js'),
    CouponAssign = require('../../models/couponAssign.js'),
    Coupon = require('../../models/coupon.js'),
    payHelper = require('../../util/payHelper.js'),
    auth = require("./auth"),
    crypto = require('crypto'),
    fs = require('fs'),
    parseString = require('xml2js').parseString,
    settings = require('../../settings'),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/adminEnrollTrainList', checkLogin);
    app.get('/admin/adminEnrollTrainList', function(req, res) {
        res.render('Server/adminEnrollTrainList.html', {
            title: '>课程报名',
            user: req.session.admin
        });
    });

    app.get('/admin/trainOrderList', checkLogin);
    app.get('/admin/trainOrderList', function(req, res) {
        res.render('Server/trainOrderList.html', {
            title: '>课程订单',
            user: req.session.admin
        });
    });

    app.post('/admin/adminEnrollTrain/search', checkLogin);
    app.post('/admin/adminEnrollTrain/search', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentName) {
            var reg = new RegExp(req.body.studentName, 'i')
            filter.studentName = {
                $regex: reg
            };
        }
        if (req.body.className) {
            var reg = new RegExp(req.body.className, 'i')
            filter.trainName = {
                $regex: reg
            };
        }
        if (req.body.trainId) {
            filter.trainId = req.body.trainId;
        }
        if (req.body.isSucceed) {
            filter.isSucceed = req.body.isSucceed;
        }
        if (req.body.isPayed) {
            filter.isPayed = req.body.isPayed;
        }
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
        }
        if (req.body.yearId) {
            filter.yearId = req.body.yearId;
        }
        if (req.body.orderId) {
            filter._id = req.body.orderId;
        }
        AdminEnrollTrain.getAll(null, page, filter, function(err, adminEnrollTrains, total) {
            if (err) {
                adminEnrollTrains = [];
            }
            res.jsonp({
                adminEnrollTrains: adminEnrollTrains,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + adminEnrollTrains.length) == total
            });
        });
    });

    app.get('/admin/rebateOrderList', checkLogin);
    app.get('/admin/rebateOrderList', function(req, res) {
        res.render('Server/rebateOrderList.html', {
            title: '>退费管理',
            user: req.session.admin
        });
    });

    app.get('/admin/paywayOrderList', checkLogin);
    app.get('/admin/paywayOrderList', function(req, res) {
        res.render('Server/paywayOrderList.html', {
            title: '>支付方式修改',
            user: req.session.admin
        });
    });

    app.get('/admin/adminEnrollTrain/orderlist/:id', checkLogin);
    app.get('/admin/adminEnrollTrain/orderlist/:id', function(req, res) {
        res.render('Server/singleClassOrderList.html', {
            title: '>课程详细订单',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.get('/admin/changeClassList', checkLogin);
    app.get('/admin/changeClassList', function(req, res) {
        res.render('Server/changeClassList.html', {
            title: '>调班管理',
            user: req.session.admin
        });
    });

    app.post('/admin/adminEnrollTrain/add', checkLogin);
    app.post('/admin/adminEnrollTrain/add', function(req, res) {
        var adminEnrollTrain = new AdminEnrollTrain({
            name: req.body.name,
            address: req.body.address
        });

        adminEnrollTrain.save(function(err, adminEnrollTrain) {
            if (err) {
                adminEnrollTrain = {};
            }
            res.jsonp(adminEnrollTrain);
        });
    });

    app.post('/admin/adminEnrollTrain/changecomment', checkLogin);
    app.post('/admin/adminEnrollTrain/changecomment', function(req, res) {
        var option = {
            comment: req.body.comment
        };
        var adminEnrollTrain = new AdminEnrollTrain(option);

        adminEnrollTrain.update(req.body.id, function(err, adminEnrollTrain) {
            if (err) {
                adminEnrollTrain = {};
                res.jsonp({ error: "更新出错了" });
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/adminEnrollTrain/changeStudent', checkLogin);
    app.post('/admin/adminEnrollTrain/changeStudent', function(req, res) {
        AdminEnrollTrain.get(req.body.id)
            .then(function(order) {
                if (order) {
                    var history = order.toJSON();
                    history.historyid = history._id;
                    history._id = null;
                    var adminEnrollTrainHistory = new AdminEnrollTrainHistory(history);
                    return adminEnrollTrainHistory.save()
                        .then(function(history) {
                            if (history) {
                                var option = {
                                    studentId: req.body.studentId,
                                    studentName: req.body.studentName,
                                };
                                var adminEnrollTrain = new AdminEnrollTrain(option);

                                return adminEnrollTrain.update(req.body.id, function(err, adminEnrollTrain) {
                                    if (err) {
                                        adminEnrollTrain = {};
                                        res.jsonp({ error: "更新出错了" });
                                    }
                                    res.jsonp({ sucess: true });
                                });
                            }
                            return res.jsonp({ error: "订单历史保存失败" });
                        });
                }
                return res.jsonp({ error: "没找到订单" });
            });
    });

    app.post('/admin/adminEnrollTrain/delete', checkLogin);
    app.post('/admin/adminEnrollTrain/delete', function(req, res) {
        AdminEnrollTrain.delete(req.body.id, function(err, adminEnrollTrain) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    function enroll(req, res) {
        AdminEnrollTrain.getByStudentAndClass(req.body.studentId, req.body.trainId)
            .then(function(enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({ error: "你已经报过名了，此课程不允许多次报名" });
                    return;
                }

                TrainClass.adminEnroll(req.body.trainId)
                    .then(function(trainClassResult) {
                        if (trainClassResult && trainClassResult.ok && trainClassResult.nModified == 1) {
                            //报名成功
                            TrainClass.get(req.body.trainId).then(function(trainClass) {
                                if (trainClass.enrollCount == trainClass.totalStudentCount) {
                                    TrainClass.full(req.body.trainId);
                                    //updated to full
                                }
                            });

                            var adminEnrollTrain = new AdminEnrollTrain({
                                studentId: req.body.studentId,
                                studentName: req.body.studentName,
                                mobile: req.body.mobile,
                                trainId: req.body.trainId,
                                trainName: req.body.trainName,
                                attributeId: req.body.attributeId,
                                attributeName: req.body.attributeName,
                                trainPrice: req.body.trainPrice,
                                materialPrice: req.body.materialPrice,
                                discount: req.body.discount,
                                totalPrice: req.body.totalPrice,
                                realMaterialPrice: req.body.realMaterialPrice,
                                isSucceed: 1,
                                comment: req.body.comment
                            });
                            adminEnrollTrain.save()
                                .then(function(enrollExam) {
                                    //修改优惠券状态
                                    if (req.body.couponId) {
                                        CouponAssign.get(req.body.couponId)
                                            .then(function(couponAssign) {
                                                if (couponAssign) {
                                                    CouponAssign.use(req.body.couponId, enrollExam._id);
                                                    res.jsonp({ sucess: true, orderId: enrollExam._id });
                                                    return;
                                                } else {
                                                    //报名3科减
                                                    Coupon.get(req.body.couponId)
                                                        .then(function(coupon) {
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
                                                                studentId: req.body.studentId,
                                                                studentName: req.body.studentName,
                                                                isUsed: true,
                                                                orderId: enrollExam._id
                                                            });
                                                            couponAssign.save().then(function(couponAssign) {
                                                                res.jsonp({ sucess: true, orderId: enrollExam._id });
                                                                return;
                                                            });
                                                        });
                                                }
                                            });
                                    } else {
                                        res.jsonp({ sucess: true, orderId: enrollExam._id });
                                        return;
                                    }
                                });
                        } else {
                            //报名失败
                            res.jsonp({ error: "报名失败,很可能报满" });
                            return;
                        }
                    });
            });
    };

    function checkScore(req, res, next) {
        TrainClass.get(req.body.trainId).then(function(trainClass) {
            if (trainClass.exams && trainClass.exams.length > 0) {
                var pArray = [],
                    minScore;
                trainClass.exams.forEach(function(exam) {
                    minScore = exam.minScore;
                    var p = AdminEnrollExam.getFilter({ examId: exam.examId, studentId: req.body.studentId, isSucceed: 1 })
                        .then(function(examOrder) {
                            if (examOrder) {
                                var subjectScore = examOrder.scores.filter(function(score) {
                                    return score.subjectId == trainClass.subjectId;
                                })[0];
                                if (subjectScore.score >= exam.minScore) {
                                    return true;
                                }
                            }
                        });
                    pArray.push(p);
                });
                Promise.all(pArray).then(function(results) {
                    if (results.some(function(result) {
                            return result;
                        })) {
                        next();
                    } else {
                        res.jsonp({ error: "本课程成绩要求" + minScore + "分，根据您的考试成绩，建议报名其他课程或咨询前台！" });
                        return;
                    }
                });
            } else {
                next();
            }
        });
    };
    app.post('/admin/adminEnrollTrain/enroll', checkLogin);
    app.post('/admin/adminEnrollTrain/enroll', enroll);

    app.post('/admin/adminEnrollTrain/enrollwithcheck', checkLogin);
    app.post('/admin/adminEnrollTrain/enrollwithcheck', checkScore);
    app.post('/admin/adminEnrollTrain/enrollwithcheck', enroll);

    app.post('/admin/adminEnrollTrain/cancel', checkLogin);
    app.post('/admin/adminEnrollTrain/cancel', function(req, res) {
        TrainClass.cancel(req.body.trainId)
            .then(function(trainClass) {
                if (trainClass && trainClass.ok && trainClass.nModified == 1) {
                    AdminEnrollTrain.cancel(req.body.id, function(err, adminEnrollTrain) {
                        if (err) {
                            res.jsonp({ error: err });
                            return;
                        }
                        res.jsonp({ sucess: true });
                        //send message to xingye
                        payHelper.closeOrder(req.body.id);
                    });
                } else {
                    res.jsonp({ error: "取消失败" });
                    return;
                }
            });
    });

    app.post('/admin/adminEnrollTrain/rebate', checkLogin);
    app.post('/admin/adminEnrollTrain/rebate', function(req, res) {
        AdminEnrollTrain.rebate(req.body.Id, req.body.price, req.body.comment)
            .then(function(adminEnrollTrain) {
                if (adminEnrollTrain && adminEnrollTrain.ok && adminEnrollTrain.nModified == 1) {
                    var rebateEnrollTrain = new RebateEnrollTrain({
                        trainOrderId: req.body.Id,
                        originalPrice: req.body.originalPrice,
                        rebatePrice: req.body.price,
                        comment: req.body.comment
                    });
                    return rebateEnrollTrain.save(req.body.id)
                        .then(function(data) {
                            if (data) {
                                AdminEnrollTrain.get(req.body.Id)
                                    .then(function(newEnrollTrain) {
                                        res.jsonp(newEnrollTrain);
                                        return;
                                    });
                            }
                        });
                } else {
                    res.jsonp({ error: "退费失败" });
                    return;
                }
            });
    });

    app.post('/admin/adminEnrollTrain/changeClass', checkLogin);
    app.post('/admin/adminEnrollTrain/changeClass', function(req, res) {
        AdminEnrollTrain.getByStudentAndClass(req.body.studentId, req.body.trainId)
            .then(function(enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({ error: "你已经报过名了，此课程不允许多次报名" });
                    return;
                }

                TrainClass.adminEnroll(req.body.trainId)
                    .then(function(trainClassResult) {
                        if (trainClassResult && trainClassResult.ok && trainClassResult.nModified == 1) {
                            //报名成功
                            TrainClass.get(req.body.trainId).then(function(trainClass) {
                                if (trainClass.enrollCount == trainClass.totalStudentCount) {
                                    TrainClass.full(req.body.trainId);
                                    //updated to full
                                }
                            });
                            return AdminEnrollTrain.get(req.body.oldOrderId)
                                .then(function(oldOrder) {
                                    var adminEnrollTrain = new AdminEnrollTrain({
                                        studentId: req.body.studentId,
                                        studentName: req.body.studentName,
                                        mobile: req.body.mobile,
                                        trainId: req.body.trainId,
                                        trainName: req.body.trainName,
                                        attributeId: req.body.attributeId,
                                        attributeName: req.body.attributeName,
                                        trainPrice: req.body.trainPrice,
                                        materialPrice: req.body.materialPrice,
                                        discount: req.body.discount,
                                        totalPrice: req.body.totalPrice,
                                        realMaterialPrice: req.body.realMaterialPrice,
                                        fromId: req.body.oldOrderId,
                                        comment: req.body.comment,
                                        isPayed: true,
                                        payWay: oldOrder.payWay
                                    });
                                    return adminEnrollTrain.save();
                                });
                        } else {
                            //报名失败
                            res.jsonp({ error: "报名失败,很可能报满" });
                            return Promise.reject();
                        }
                    })
                    .then(function(order) {
                        if (order) {
                            CouponAssign.updateOrder({ orderId: req.body.oldOrderId }, { orderId: order._id });
                            return TrainClass.cancel(req.body.oldTrainId);
                        } else {
                            res.jsonp({ error: "报名订单保存失败" });
                            return Promise.reject();
                        }
                    })
                    .then(function(result) {
                        if (result && result.ok && result.nModified == 1) {
                            return AdminEnrollTrain.changeClass(req.body.oldOrderId);
                        } else {
                            res.jsonp({ error: "修改老班级数失败" });
                            return Promise.reject();
                        }
                    })
                    .then(function(adminEnrollTrain) {
                        if (adminEnrollTrain && adminEnrollTrain.ok && adminEnrollTrain.nModified == 1) {
                            res.jsonp({ sucess: true });
                            return;
                        } else {
                            res.jsonp({ error: "取消老订单失败" });
                            return Promise.reject();
                        }
                    })
                    .catch(function(err) {

                    });
            });
    });

    app.get('/admin/changeClassDetail/:id', checkLogin);
    app.get('/admin/changeClassDetail/:id', function(req, res) {
        // req.params.id
        AdminEnrollTrain.get(req.params.id)
            .then(function(order) {
                res.render('Server/changeClassDetail.html', {
                    title: '>调班管理',
                    user: req.session.admin,
                    order: order
                });
            })

    });

    app.get('/admin/payList/:id', checkLogin);
    app.get('/admin/payList/:id', function(req, res) {
        AdminEnrollTrain.get(req.params.id)
            .then(function(trainOrder) {
                res.render('Server/payList.html', {
                    title: '>订单支付',
                    user: req.session.admin,
                    trainOrder: trainOrder
                });
            });
    });

    app.post('/admin/adminEnrollTrain/pay', checkLogin);
    app.post('/admin/adminEnrollTrain/pay', function(req, res) {
        AdminEnrollTrain.pay(req.body.id, req.body.payWay)
            .then(function(result) {
                if (result && result.nModified == 1) {
                    res.jsonp({ sucess: true });
                    return;
                }
                res.jsonp({ error: "付款失败" });
            });
    });

    app.post('/admin/adminEnrollTrain/payCode', checkLogin);
    app.post('/admin/adminEnrollTrain/payCode', function(req, res) {
        AdminEnrollTrain.get(req.body.id)
            .then(function(order) {
                if (order) {
                    var payParas = {
                        out_trade_no: order._id,
                        body: order.trainName,
                        total_fee: ((order.totalPrice || 0) + (order.realMaterialPrice || 0)) * 100
                    };
                    payHelper.pay(payParas, res);
                    return;
                }
                res.jsonp({ error: "生成付款码失败" });
            });
    });

    app.post('/admin/pay/notify', function(req, res) {
        //xingye pay result
        debugger;
        var arr = [];
        req.on("data", function(data) {
            arr.push(data);
            debugger;
        });
        req.on("end", function() {
            var data = Buffer.concat(arr).toString(),
                ret;
            try {
                debugger;
                var newLog = fs.createWriteStream('newLog.log', {
                    flags: 'a'
                });
                parseString(data, function(err, resultObject) {
                    var result = resultObject.xml;
                    var keys = Object.getOwnPropertyNames(result).sort(),
                        strResult = "";
                    keys.forEach(function(key) {
                        var v = result[key];
                        if ("sign" != key && "key" != key) {
                            strResult = strResult + key + "=" + v + "&";
                        }
                    });
                    strResult = strResult + "key=" + settings.key;
                    var md5 = crypto.createHash('md5'),
                        sign = md5.update(strResult).digest('hex').toUpperCase();
                    if (sign == (result.sign + "")) {
                        if (parseInt(result.status + "") == 0 && parseInt(result.result_code + "") == 0) {
                            var orderId = result.out_trade_no + "";
                            AdminEnrollTrain.get(orderId)
                                .then(function(order) {
                                    var orderFee = ((order.totalPrice || 0) + (order.realMaterialPrice || 0)) * 100;
                                    if (orderFee.toString() == (result.total_fee + "")) {
                                        AdminEnrollTrain.pay(orderId, 6) //wechat online
                                            .then(function(result) {
                                                if (result && result.nModified == 1) {
                                                    res.end("success");
                                                    return;
                                                }
                                            });
                                    }
                                });
                        } else {
                            res.end("failure1");
                        }
                    } else {
                        res.end("failure2");
                    }
                });
            } catch (err) {}
        })
    });

    app.post('/admin/adminEnrollTrain/checkAttributs', checkLogin);
    app.post('/admin/adminEnrollTrain/checkAttributs', function(req, res) {
        var filter = {
            studentId: req.body.studentId,
            attributeId: req.body.attributeId,
            isPayed: true,
            isSucceed: 1
        }
        AdminEnrollTrain.getCount(filter)
            .then(function(result) {
                if (result && result >= 2) {
                    Coupon.getFilter({ category: req.body.attributeId })
                        .then(function(coupon) {
                            res.jsonp(coupon);
                        });
                } else {
                    res.jsonp(false);
                }
            });
    });

    app.post('/admin/adminEnrollTrain/isAttributCouponUsed', checkLogin);
    app.post('/admin/adminEnrollTrain/isAttributCouponUsed', function(req, res) {
        var filter = {
            studentId: req.body.studentId,
            attributeId: req.body.attributeId,
            isPayed: true,
            isSucceed: 1
        }
        AdminEnrollTrain.getFilters(filter)
            .then(function(results) {
                if (results && results.length > 0) {
                    var orderIds = results.map(function(order) {
                        return order._id;
                    });
                    var filter = { isUsed: true, orderId: { $in: orderIds } };
                    CouponAssign.getFilters(filter)
                        .then(function(coupons) {
                            if (coupons && coupons.length > 0) {
                                var names = coupons.map(function(coupon) {
                                    return coupon.couponName;
                                });
                                res.jsonp(names.join(";"));
                            } else {
                                res.jsonp(false);
                            }
                        });
                } else {
                    res.jsonp(false);
                }
            });
    });

    app.post('/admin/adminEnrollTrain/changePayway', checkLogin);
    app.post('/admin/adminEnrollTrain/changePayway', function(req, res) {
        AdminEnrollTrain.changePayway(req.body.id, req.body.payWay)
            .then(function(adminEnrollTrain) {
                if (adminEnrollTrain && adminEnrollTrain.ok && adminEnrollTrain.nModified == 1) {
                    res.jsonp({ sucess: true });
                } else {
                    res.jsonp({ error: "修改支付方式失败" });
                    return;
                }
            });
    });

    app.get('/admin/adminEnrollTrain/orderDetail/:id', checkLogin);
    app.get('/admin/adminEnrollTrain/orderDetail/:id', function(req, res) {
        res.render('Server/trainOrderDetail.html', {
            title: '>订单详情',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.get('/admin/adminEnrollTrain/trainDetail/:id', checkLogin);
    app.get('/admin/adminEnrollTrain/trainDetail/:id', function(req, res) {
        res.render('Server/trainDetail.html', {
            title: '>课程详情',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.post('/admin/adminEnrollTrain/getorder', checkLogin);
    app.post('/admin/adminEnrollTrain/getorder', function(req, res) {
        AdminEnrollTrain.get(req.body.id)
            .then(function(adminEnrollTrain) {
                if (adminEnrollTrain) {
                    res.jsonp(adminEnrollTrain);
                } else {
                    res.jsonp({ error: "没找到订单" });
                    return;
                }
            });
    });
}