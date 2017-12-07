var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    AdminEnrollTrain = model.adminEnrollTrain,
    AdminEnrollTrainHistory = model.adminEnrollTrainHistory,
    AdminEnrollExam = model.adminEnrollExam,
    TrainClass = model.trainClass,
    TrainClassExams = model.trainClassExams,
    RebateEnrollTrain = model.rebateEnrollTrain,
    CouponAssign = model.couponAssign,
    Coupon = model.coupon,
    payHelper = require('../../util/payHelper.js'),
    auth = require("./auth"),
    crypto = require('crypto'),
    fs = require('fs'),
    parseString = require('xml2js').parseString,
    settings = require('../../settings'),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/adminEnrollTrainList', checkLogin);
    app.get('/admin/adminEnrollTrainList', auth.checkSecure([0, 3, 7, 8]));
    app.get('/admin/adminEnrollTrainList', function (req, res) {
        res.render('Server/adminEnrollTrainList.html', {
            title: '>课程报名',
            user: req.session.admin
        });
    });

    app.get('/admin/trainOrderList', checkLogin);
    app.get('/admin/trainOrderList', function (req, res) {
        res.render('Server/trainOrderList.html', {
            title: '>课程订单',
            user: req.session.admin
        });
    });

    app.get('/admin/trainOrderList/id/:id', checkLogin);
    app.get('/admin/trainOrderList/id/:id', function (req, res) {
        res.render('Server/trainOrderList.html', {
            title: '>课程订单',
            user: req.session.admin,
            orderId: req.params.id
        });
    });

    app.post('/admin/adminEnrollTrain/search', checkLogin);
    app.post('/admin/adminEnrollTrain/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var strSqlMiddle = " from adminEnrollTrains O join trainClasss C on O.trainId=C._id where O.isDeleted=false and C.isDeleted=false ",
            strSql1 = "select count(0) as count ",
            strSql2 = "select O.* ",
            replacements = {};
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentName && req.body.studentName.trim()) {
            strSqlMiddle += " and O.studentName like :studentName ";
            replacements.studentName = "%" + req.body.studentName.trim() + "%";
        }
        if (req.body.className) {
            strSqlMiddle += " and O.trainName like :trainName ";
            replacements.trainName = "%" + req.body.className.trim() + "%";
        }
        if (req.body.trainId) {
            strSqlMiddle += " and O.trainId=:trainId ";
            replacements.trainId = req.body.trainId;
        }
        if (req.body.isSucceed) {
            strSqlMiddle += " and O.isSucceed=:isSucceed ";
            replacements.isSucceed = req.body.isSucceed;
        }
        if (req.body.isPayed) {
            strSqlMiddle += " and O.isPayed=:isPayed ";
            replacements.isPayed = (req.body.isPayed == "true" ? true : false);
        }
        if (req.body.studentId) {
            strSqlMiddle += " and O.studentId=:studentId ";
            replacements.studentId = req.body.studentId;
        }
        if (req.body.yearId) {
            strSqlMiddle += " and O.yearId=:yearId ";
            replacements.yearId = req.body.yearId;
        }
        if (req.body.orderId) {
            strSqlMiddle += " and O._id=:orderId ";
            replacements.orderId = req.body.orderId;
        }
        if (req.body.schoolId) {
            strSqlMiddle += " and O.schoolId=:schoolId ";
            replacements.schoolId = req.body.schoolId;
        }
        if (req.body.attributeId) {
            strSqlMiddle += " and C.attributeId=:attributeId ";
            replacements.attributeId = req.body.attributeId;
        }
        var offset = ((page - 1) * pageSize);
        strSql2 += strSqlMiddle + " order by O.createdDate desc, O._id desc LIMIT " + offset + ", " + pageSize;
        strSql1 += strSqlMiddle;

        model.db.sequelize.query(strSql1, {
                replacements: replacements,
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (counts) {
                if (counts && counts.length > 0) {
                    var total = counts[0].count;
                    model.db.sequelize.query(strSql2, {
                            replacements: replacements,
                            type: model.db.sequelize.QueryTypes.SELECT
                        })
                        .then(orders => {
                            res.jsonp({
                                adminEnrollTrains: orders,
                                total: total,
                                page: page,
                                isFirstPage: (page - 1) == 0,
                                isLastPage: (offset + orders.length) == total
                            });
                        });
                }
            });
    });

    app.get('/admin/rebateOrderList', checkLogin);
    app.get('/admin/rebateOrderList', function (req, res) {
        res.render('Server/rebateOrderList.html', {
            title: '>退费管理',
            user: req.session.admin
        });
    });

    app.get('/admin/paywayOrderList', checkLogin);
    app.get('/admin/paywayOrderList', function (req, res) {
        res.render('Server/paywayOrderList.html', {
            title: '>支付方式修改',
            user: req.session.admin
        });
    });

    app.get('/admin/rebatewayOrderList', checkLogin);
    app.get('/admin/rebatewayOrderList', function (req, res) {
        res.render('Server/rebatewayOrderList.html', {
            title: '>退款方式修改',
            user: req.session.admin
        });
    });

    app.get('/admin/upgradeList', checkLogin);
    app.get('/admin/upgradeList', function (req, res) {
        res.render('Server/upgradeList.html', {
            title: '>学生课程难度提升',
            user: req.session.admin
        });
    });

    app.get('/admin/adminEnrollTrain/orderlist/:id', checkLogin);
    app.get('/admin/adminEnrollTrain/orderlist/:id', function (req, res) {
        res.render('Server/singleClassOrderList.html', {
            title: '>课程详细订单',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.get('/admin/changeClassList', checkLogin);
    app.get('/admin/changeClassList', function (req, res) {
        res.render('Server/changeClassList.html', {
            title: '>调班管理',
            user: req.session.admin
        });
    });

    app.post('/admin/adminEnrollTrain/changecomment', checkLogin);
    app.post('/admin/adminEnrollTrain/changecomment', function (req, res) {
        var option = {
            comment: req.body.comment
        };
        AdminEnrollTrain.update(option, {
            where: {
                _id: req.body.id
            }
        }).then(result => {
            res.jsonp({
                sucess: true
            });
        }).catch(err => {
            res.jsonp({
                error: "更新出错了"
            });
        });
    });

    // 学生信息由于某些原因不正确了，需要重新设置
    app.post('/admin/adminEnrollTrain/changeStudent', checkLogin);
    app.post('/admin/adminEnrollTrain/changeStudent', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.body.id
            })
            .then(order => {
                if (order) {
                    var history = order.toJSON();
                    history.historyid = history._id;
                    history.createdBy = req.session.admin._id;
                    history._id = null;
                    // 1. 生成历史记录
                    // 2. 更新订单
                    model.db.sequelize.transaction(function (t1) {
                            return AdminEnrollTrainHistory.create(history, {
                                    transaction: t1
                                })
                                .then(function (resultArea) {
                                    var option = {
                                        studentId: req.body.studentId,
                                        studentName: req.body.studentName,
                                    };

                                    return AdminEnrollTrain.update(option, {
                                        where: {
                                            _id: req.body.id
                                        },
                                        transaction: t1
                                    });
                                });
                        })
                        .then(function (result) {
                            res.jsonp({
                                sucess: true
                            });
                        })
                        .catch(function () {
                            res.jsonp({
                                error: "修改失败"
                            });
                        });
                } else {
                    return res.jsonp({
                        error: "没找到订单"
                    });
                }
            });
    });

    // 报名详细方法,管理员可以超员报名
    function enroll(req, res) {
        AdminEnrollTrain.getFilter({
                studentId: req.body.studentId,
                trainId: req.body.trainId,
                isSucceed: 1
            })
            .then(function (enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({
                        error: "你已经报过名了，此课程不允许多次报名"
                    });
                    return;
                }
                TrainClass.getFilter({
                        _id: req.body.trainId
                    })
                    .then(trainClass => {
                        // 1. 修改报名人数
                        // 2. 如果报满修改字段为满员 (may useless)
                        // 3. 添加新订单
                        model.db.sequelize.transaction(function (t1) {
                                return TrainClass.update({
                                        enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                    }, {
                                        where: {
                                            _id: req.body.trainId
                                        },
                                        transaction: t1
                                    })
                                    .then(function () {
                                        if (global) {
                                            return AdminEnrollTrain.create({
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
                                                    comment: req.body.comment,
                                                    createdBy: req.session.admin._id,
                                                    schoolId: req.body.schoolId,
                                                    schoolArea: req.body.schoolArea,
                                                    yearId: trainClass.yearId,
                                                    yearName: trainClass.yearName
                                                }, {
                                                    transaction: t1
                                                })
                                                .then(order => {
                                                    if (req.body.couponId) {
                                                        // 假定是优惠券的ID而不是分配好的优惠券
                                                        return Coupon.getFilter({
                                                                _id: req.body.couponId
                                                            })
                                                            .then(coupon => {
                                                                if (coupon) { // 报名3科减
                                                                    return CouponAssign.create({
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
                                                                            orderId: order._id,
                                                                            createdBy: req.session.admin._id
                                                                        })
                                                                        .then(assign => {
                                                                            return order;
                                                                        });
                                                                } else {
                                                                    // 分配好的优惠券, couponId 就是assignId
                                                                    return CouponAssign.getFilter({
                                                                            _id: req.body.couponId,
                                                                            studentId: req.body.studentId,
                                                                            isDeleted: false,
                                                                            isUsed: false
                                                                        })
                                                                        .then(function (couponAssign) {
                                                                            if (couponAssign) {
                                                                                // 优惠券就是真实未使用的
                                                                                return CouponAssign.update({
                                                                                        isUsed: true,
                                                                                        orderId: order._id
                                                                                    }, {
                                                                                        where: {
                                                                                            _id: couponAssign._id
                                                                                        },
                                                                                        transaction: t1
                                                                                    })
                                                                                    .then(result => {
                                                                                        return order;
                                                                                    });
                                                                            } else {
                                                                                // 优惠券状态更改,报名失败
                                                                                throw new Error("优惠券状态发生更改");
                                                                            }
                                                                        });
                                                                }
                                                            });
                                                    } else {
                                                        return order;
                                                    }
                                                });
                                        }
                                    });
                            })
                            .then(function (order) {
                                res.jsonp({
                                    sucess: true,
                                    orderId: order._id
                                });
                            })
                            .catch(function (err) {
                                res.jsonp({
                                    error: "报名失败"
                                });
                            });
                    });
            });
    };

    function checkScore(req, res, next) {
        TrainClassExams.getFilters({
                trainClassId: req.body.trainId
            })
            .then(function (exams) {
                if (exams && exams.length > 0) {
                    TrainClass.getFilter({
                            _id: req.body.trainId
                        })
                        .then(trainClass => {
                            var pArray = [],
                                minScore;
                            exams.forEach(function (exam) {
                                minScore = exam.minScore;
                                var p = model.db.sequelize.query("select S.score from adminEnrollExams O join adminEnrollExamScores S \
                                            on O._id=S.examOrderId \
                                            where O.examId=:examId and O.studentId=:studentId and O.isDeleted=false and O.isSucceed=1 and \
                                            S.isDeleted=false and S.subjectId=:subjectId", {
                                        replacements: {
                                            examId: exam.examId,
                                            studentId: req.body.studentId,
                                            subjectId: trainClass.subjectId
                                        },
                                        type: model.db.sequelize.QueryTypes.SELECT
                                    })
                                    .then(scores => {
                                        if (scores && scores.length > 0 && scores[0] >= minScore) {
                                            return true;
                                        }
                                    });
                                pArray.push(p);
                            });
                            Promise.all(pArray).then(function (results) {
                                if (results.some(function (result) {
                                        return result;
                                    })) {
                                    next();
                                } else {
                                    res.jsonp({
                                        error: "本课程成绩要求" + minScore + "分，根据您的考试成绩，建议报名其他课程或咨询前台！"
                                    });
                                    return;
                                }
                            });
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

    // 人为只能退班，不能真的取消
    app.post('/admin/adminEnrollTrain/cancel', checkLogin);
    app.post('/admin/adminEnrollTrain/cancel', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.body.id,
                isSucceed: 1
            })
            .then(function (order) {
                if (order) {
                    // 1. 修改课程人数
                    // 2. 取消订单
                    model.db.sequelize.transaction(function (t1) {
                            return AdminEnrollTrain.update({
                                    isSucceed: (order.isPayed ? 7 : 9),
                                    deletedBy: req.session.admin._id,
                                    deletedDate: new Date()
                                }, {
                                    where: {
                                        _id: req.body.id,
                                        isSucceed: 1
                                    },
                                    transaction: t1
                                })
                                .then(function (updateResult) {
                                    if (updateResult && updateResult[0]) {
                                        return TrainClass.update({
                                                enrollCount: model.db.sequelize.literal('`enrollCount`-1')
                                            }, {
                                                where: {
                                                    _id: req.body.trainId
                                                },
                                                transaction: t1
                                            })
                                            .then(function () {
                                                return CouponAssign.update({
                                                    isUsed: false
                                                }, {
                                                    where: {
                                                        orderId: req.body.id
                                                    },
                                                    transaction: t1
                                                });
                                            });
                                    }
                                });
                        })
                        .then(function () {
                            if (order.payWay == 6 || order.payWay == 7) {
                                //send message to xingye
                                payHelper.closeOrder(req.body.id, order.schoolArea);
                            }

                            res.jsonp({
                                sucess: true,
                                orderId: order._id
                            });
                        }).catch(function (err) {
                            res.jsonp({
                                error: "取消失败"
                            });
                        });
                } else {
                    res.jsonp({
                        error: "取消失败，或许订单已经取消"
                    });
                    return;
                }
            });
    });

    // 预交钱处理，没有好的解决方案，后续再处理
    app.post('/admin/adminEnrollTrain/preSave', checkLogin);
    app.post('/admin/adminEnrollTrain/preSave', function (req, res) {
        // AdminEnrollTrain.getFilter({
        //     _id: req.body.id,
        //     isSucceed: 1
        // }).then(function (order) {
        //     if (order) {
        //         TrainClass.cancel(req.body.trainId)
        //             .then(function (trainClass) {
        //                 if (trainClass && trainClass.ok && trainClass.nModified == 1) {
        //                     AdminEnrollTrain.preSave(req.body.id, function (err, adminEnrollTrain) {
        //                         if (err) {
        //                             res.jsonp({
        //                                 error: err
        //                             });
        //                             return;
        //                         }
        //                         res.jsonp({
        //                             sucess: true
        //                         });
        //                     });
        //                 } else {
        //                     res.jsonp({
        //                         error: "预存失败"
        //                     });
        //                     return;
        //                 }
        //             });

        //     } else {
        //         res.jsonp({
        //             error: "预存失败，或许订单已经预存"
        //         });
        //         return;
        //     }
        // });
    });

    // 退款
    app.post('/admin/adminEnrollTrain/rebate', checkLogin);
    app.post('/admin/adminEnrollTrain/rebate', function (req, res) {
        var price = parseFloat(req.body.price),
            materialPrice = parseFloat(req.body.materialPrice);

        model.db.sequelize.transaction(function (t1) {
            // 订单退款
            return AdminEnrollTrain.update({
                rebatePrice: model.db.sequelize.literal('`rebatePrice`+' + (price + materialPrice)),
                realMaterialPrice: model.db.sequelize.literal('`realMaterialPrice`-' + materialPrice),
                totalPrice: model.db.sequelize.literal('`totalPrice`-' + price),
                comment: req.body.comment
            }, {
                where: {
                    _id: req.body.Id
                },
                transaction: t1
            }).then(result => {
                // 保存退款记录
                return RebateEnrollTrain.create({
                    trainOrderId: req.body.Id,
                    originalPrice: req.body.originalPrice,
                    rebateTotalPrice: price + materialPrice,
                    rebatePrice: req.body.price,
                    rebateWay: req.body.payWay,
                    rebateMaterialPrice: req.body.materialPrice,
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

    // 由于银行方面问题，在线退款意义不大
    app.post('/admin/adminEnrollTrain/onlineRebate', checkLogin);
    app.post('/admin/adminEnrollTrain/onlineRebate', function (req, res) {
        // AdminEnrollTrain.rebate(req.body.Id, parseFloat(req.body.price), parseFloat(req.body.materialPrice), req.body.comment)
        //     .then(function (adminEnrollTrain) {
        //         //订单退款成功
        //         if (adminEnrollTrain && adminEnrollTrain.ok && adminEnrollTrain.nModified == 1) {
        //             var rebateEnrollTrain = new RebateEnrollTrain({
        //                 trainOrderId: req.body.Id,
        //                 originalPrice: req.body.originalPrice,
        //                 rebateTotalPrice: parseFloat(req.body.price) + parseFloat(req.body.materialPrice),
        //                 rebatePrice: req.body.price,
        //                 rebateMaterialPrice: req.body.materialPrice,
        //                 comment: req.body.comment,
        //                 createdBy: req.session.admin._id
        //             });
        //             return rebateEnrollTrain.save()
        //                 .then(function (rebateRecord) {
        //                     //保存退款记录
        //                     if (rebateRecord) {
        //                         //线上退款
        //                         AdminEnrollTrain.get(req.body.Id)
        //                             .then(function (order) {
        //                                 if (order) {
        //                                     var payParas = {
        //                                         out_refund_no: rebateRecord._id,
        //                                         out_trade_no: (order.baseId || order._id),
        //                                         refund_fee: rebateRecord.rebateTotalPrice * 100,
        //                                         total_fee: ((parseFloat(order.totalPrice) || 0) + (parseFloat(order.realMaterialPrice) || 0) + (order.rebatePrice || 0)) * 100
        //                                     };
        //                                     payHelper.jsRebate(payParas, res, order.schoolArea);
        //                                     res.jsonp({
        //                                         sucess: true
        //                                     });
        //                                     return;
        //                                 }
        //                                 res.jsonp({
        //                                     error: "没找到原订单"
        //                                 });
        //                             });
        //                     }
        //                 });
        //         } else {
        //             res.jsonp({
        //                 error: "退费失败"
        //             });
        //             return;
        //         }
        //     });
    });

    // 调班调班
    app.post('/admin/adminEnrollTrain/changeClass', checkLogin);
    app.post('/admin/adminEnrollTrain/changeClass', function (req, res) {
        AdminEnrollTrain.getFilter({
                studentId: req.body.studentId,
                trainId: req.body.trainId,
                isSucceed: 1
            })
            .then(function (enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({
                        error: "你已经报过名了，此课程不允许多次报名"
                    });
                    return;
                }
                AdminEnrollTrain.getFilter({
                        _id: req.body.oldOrderId,
                        isSucceed: 1
                    })
                    .then(function (oldOrder) {
                        if (!oldOrder) {
                            res.jsonp({
                                error: "订单已经被处理，不能重复处理"
                            });
                            return;
                        }
                        // 1. 新班报名修改名额
                        // 2. 新班设置是否满员-- 可能没必要
                        // 3. 添加新订单
                        // 4. 更改优惠券的订单-- 可能没必要
                        // 5. 老班级修改名额
                        // 6. 设置老订单过期
                        model.db.sequelize.transaction(function (t1) {
                            return TrainClass.update({
                                    enrollCount: model.db.sequelize.literal('`enrollCount`+1')
                                }, {
                                    where: {
                                        _id: req.body.trainId
                                    },
                                    transaction: t1
                                })
                                .then(function () {
                                    if (global) {
                                        return AdminEnrollTrain.create({
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
                                            rebatePrice: oldOrder.rebatePrice,
                                            superCategoryId: oldOrder.superCategoryId,
                                            superCategoryName: oldOrder.superCategoryName,
                                            payWay: oldOrder.payWay,
                                            createdBy: req.session.admin._id,
                                            baseId: (oldOrder.baseId || oldOrder._id),
                                            schoolId: req.body.schoolId,
                                            schoolArea: req.body.schoolArea,
                                            yearId: oldOrder.yearId,
                                            yearName: oldOrder.yearName
                                        }, {
                                            transaction: t1
                                        }).then(order => {
                                            return TrainClass.update({
                                                enrollCount: model.db.sequelize.literal('`enrollCount`-1')
                                            }, {
                                                where: {
                                                    _id: req.body.oldTrainId
                                                },
                                                transaction: t1
                                            }).then(function () {
                                                var cancelType = 1;
                                                if (oldOrder.schoolId != req.body.schoolId) {
                                                    cancelType = 2; // 跨校区调班
                                                }
                                                return AdminEnrollTrain.update({
                                                    isSucceed: 9,
                                                    cancelType: cancelType,
                                                    deletedDate: new Date(),
                                                    deletedBy: req.session.admin._id
                                                }, {
                                                    where: {
                                                        _id: req.body.oldOrderId
                                                    },
                                                    transaction: t1
                                                });
                                            });
                                        });
                                    }
                                });
                        }).then(function (order) {
                            res.jsonp({
                                sucess: true,
                                orderId: order._id
                            });
                        }).catch(function (err) {
                            res.jsonp({
                                error: "修改班级失败"
                            });
                        });
                    });
            });
    });

    app.get('/admin/changeClassDetail/:id', checkLogin);
    app.get('/admin/changeClassDetail/:id', function (req, res) {
        // req.params.id
        AdminEnrollTrain.getFilter({
                _id: req.params.id,
                isSucceed: 1 // 防止刷新重新操作
            })
            .then(function (order) {
                TrainClass.getFilter({
                        _id: order.trainId
                    })
                    .then(trainClass => {
                        var orderResult = order.toJSON();
                        orderResult.gradeId = trainClass.gradeId;
                        orderResult.subjectId = trainClass.subjectId;
                        orderResult.categoryId = trainClass.categoryId;
                        res.render('Server/changeClassDetail.html', {
                            title: '>调班管理',
                            user: req.session.admin,
                            order: orderResult
                        });
                    });
            })
    });

    app.get('/admin/payList/:id', checkLogin);
    app.get('/admin/payList/:id', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.params.id
            })
            .then(function (trainOrder) {
                res.render('Server/payList.html', {
                    title: '>订单支付',
                    user: req.session.admin,
                    trainOrder: trainOrder
                });
            });
    });

    app.post('/admin/adminEnrollTrain/pay', checkLogin);
    app.post('/admin/adminEnrollTrain/pay', function (req, res) {
        AdminEnrollTrain.update({
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

    // to be check in production
    app.post('/admin/adminEnrollTrain/payCode', checkLogin);
    app.post('/admin/adminEnrollTrain/payCode', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.body.id
            })
            .then(function (order) {
                if (order) {
                    var payParas = {
                        out_trade_no: order._id,
                        body: order.trainName,
                        total_fee: ((parseFloat(order.totalPrice) || 0) + (parseFloat(order.realMaterialPrice) || 0)) * 100
                    };
                    payHelper.pay(payParas, res, order.schoolArea);
                    return;
                }
                res.jsonp({
                    error: "生成付款码失败"
                });
            });
    });

    function getPaySetting(schoolName) {
        if (schoolName == "中南校区") {
            return settings.pays.topublic;
        } else {
            return settings.pays.toprivate;
        }
    };

    // to be check in production
    app.post('/admin/pay/notify', function (req, res) {
        //xingye pay result
        debugger;
        var arr = [];
        req.on("data", function (data) {
            arr.push(data);
            debugger;
        });
        req.on("end", function () {
            var data = Buffer.concat(arr).toString(),
                ret;
            try {
                debugger;
                var newLog = fs.createWriteStream('newLog.log', {
                    flags: 'a'
                });
                parseString(data, function (err, resultObject) {
                    var result = resultObject.xml;
                    var orderId = result.out_trade_no + "";
                    AdminEnrollTrain.getFilter({
                            _id: orderId
                        })
                        .then(function (order) {
                            var paySetting = getPaySetting(order.schoolArea),
                                keys = Object.getOwnPropertyNames(result).sort(),
                                strResult = "";
                            keys.forEach(function (key) {
                                var v = result[key];
                                if ("sign" != key && "key" != key) {
                                    strResult = strResult + key + "=" + v + "&";
                                }
                            });
                            strResult = strResult + "key=" + paySetting.key;
                            var md5 = crypto.createHash('md5'),
                                sign = md5.update(strResult).digest('hex').toUpperCase();
                            if (sign == (result.sign + "")) {
                                if (parseInt(result.status + "") == 0 && parseInt(result.result_code + "") == 0) {
                                    var orderFee = ((parseFloat(order.totalPrice) || 0) + (parseFloat(order.realMaterialPrice) || 0)) * 100;
                                    if (orderFee.toString() == (result.total_fee + "")) {
                                        // wechat online, zhifubao is wrong
                                        AdminEnrollTrain.update({
                                                isPayed: true,
                                                payWay: 6
                                            }, {
                                                where: {
                                                    _id: orderId
                                                }
                                            })
                                            .then(function (result) {
                                                if (result && result.nModified == 1) {
                                                    res.end("success");
                                                    return;
                                                }
                                            });
                                    }
                                } else {
                                    res.end("failure1");
                                }
                            } else {
                                res.end("failure2");
                            }
                        });
                });
            } catch (err) {}
        })
    });

    app.post('/admin/adminEnrollTrain/checkAttributs', checkLogin);
    app.post('/admin/adminEnrollTrain/checkAttributs', function (req, res) {
        var filter = {
            studentId: req.body.studentId,
            attributeId: req.body.attributeId,
            isPayed: true,
            isSucceed: 1
        }
        AdminEnrollTrain.count({
                where: filter
            })
            .then(function (result) {
                if (result && result >= 2) {
                    Coupon.getFilter({
                            category: req.body.attributeId
                        })
                        .then(function (coupon) {
                            res.jsonp(coupon);
                        });
                } else {
                    res.jsonp(false);
                }
            });
    });

    app.post('/admin/adminEnrollTrain/isAttributCouponUsed', checkLogin);
    app.post('/admin/adminEnrollTrain/isAttributCouponUsed', function (req, res) {
        var filter = {
            studentId: req.body.studentId,
            attributeId: req.body.attributeId,
            isPayed: true,
            isSucceed: 1
        }
        AdminEnrollTrain.getFilters(filter)
            .then(function (results) {
                if (results && results.length > 0) {
                    var orderIds = results.map(function (order) {
                        return order._id;
                    });
                    var filter = {
                        isUsed: true,
                        orderId: {
                            $in: orderIds
                        }
                    };
                    CouponAssign.getFilters(filter)
                        .then(function (coupons) {
                            if (coupons && coupons.length > 0) {
                                var names = coupons.map(function (coupon) {
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
    app.post('/admin/adminEnrollTrain/changePayway', function (req, res) {
        AdminEnrollTrain.getFilter({
            _id: req.body.id
        }).then(function (order) {
            var history = {
                historyid: req.body.id,
                createdBy: req.session.admin._id,
                payWay: req.body.payWay,
                comment: "修改支付方式"
            };
            // 1. 生成历史记录
            // 2. 更新订单
            model.db.sequelize.transaction(function (t1) {
                return AdminEnrollTrainHistory.create(history, {
                        transaction: t1
                    })
                    .then(function (resultArea) {
                        return AdminEnrollTrain.update({
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

    // 升报
    app.post('/admin/adminEnrollTrain/upgrade', checkLogin);
    app.post('/admin/adminEnrollTrain/upgrade', function (req, res) {
        // superCategoryId superCategoryName
        AdminEnrollTrain.update({
                superCategoryId: req.body.categoryId,
                superCategoryName: req.body.categoryName
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (adminEnrollTrain) {
                res.jsonp({
                    sucess: true
                });
            }).catch(function () {
                res.jsonp({
                    error: "修改难度失败"
                });
            });
    });

    app.get('/admin/adminEnrollTrain/orderDetail/:id', checkLogin);
    app.get('/admin/adminEnrollTrain/orderDetail/:id', function (req, res) {
        res.render('Server/trainOrderDetail.html', {
            title: '>订单详情',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.get('/admin/adminEnrollTrain/trainDetail/:id', checkLogin);
    app.get('/admin/adminEnrollTrain/trainDetail/:id', function (req, res) {
        res.render('Server/trainDetail.html', {
            title: '>课程详情',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.post('/admin/adminEnrollTrain/getorder', checkLogin);
    app.post('/admin/adminEnrollTrain/getorder', function (req, res) {
        AdminEnrollTrain.getFilter({
                _id: req.body.id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                } else {
                    res.jsonp({
                        error: "没找到订单"
                    });
                    return;
                }
            });
    });

    // change trainId to objectId
    app.post('/admin/AdminEnrollTrain/ChangeTrainId', checkLogin);
    app.post('/admin/AdminEnrollTrain/ChangeTrainId', function (req, res) {
        // var p0 = AdminEnrollTrain.getFilters({})
        //     .then(function (orders) {
        //         var pArray = [];
        //         orders.forEach(function (order) {
        //             pArray.push(AdminEnrollTrain.changeTrainId(order));
        //         });

        //         return Promise.all(pArray);
        //     });

        // var p1 = RebateEnrollTrain.getFilters({})
        //     .then(function (orders) {
        //         var pArray = [];
        //         orders.forEach(function (order) {
        //             pArray.push(RebateEnrollTrain.changeTrainId(order));
        //         });

        //         return Promise.all(pArray);
        //     });

        // Promise.all([p0, p1]).then(function () {
        //     res.jsonp({
        //         sucess: true
        //     });
        // });
    });
}