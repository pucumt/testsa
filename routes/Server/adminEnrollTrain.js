var AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    TrainClass = require('../../models/trainClass.js'),
    RebateEnrollTrain = require('../../models/rebateEnrollTrain.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/adminEnrollTrainList', checkLogin);
    app.get('/admin/adminEnrollTrainList', function(req, res) {
        res.render('Server/adminEnrollTrainList.html', {
            title: '>课程报名',
            user: req.session.user
        });
    });

    app.get('/admin/trainOrderList', checkLogin);
    app.get('/admin/trainOrderList', function(req, res) {
        res.render('Server/trainOrderList.html', {
            title: '>课程订单',
            user: req.session.user
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
        if (req.body.isSucceed) {
            filter.isSucceed = req.body.isSucceed;
        }
        if (req.body.isPayed) {
            filter.isPayed = req.body.isPayed;
        }
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
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
            user: req.session.user
        });
    });

    app.get('/admin/changeClassList', checkLogin);
    app.get('/admin/changeClassList', function(req, res) {
        res.render('Server/changeClassList.html', {
            title: '>调班管理',
            user: req.session.user
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

    app.post('/admin/adminEnrollTrain/edit', checkLogin);
    app.post('/admin/adminEnrollTrain/edit', function(req, res) {
        var adminEnrollTrain = new AdminEnrollTrain({
            name: req.body.name,
            address: req.body.address
        });

        adminEnrollTrain.update(req.body.id, function(err, adminEnrollTrain) {
            if (err) {
                adminEnrollTrain = {};
            }
            res.jsonp(adminEnrollTrain);
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

    app.post('/admin/adminEnrollTrain/enroll', checkLogin);
    app.post('/admin/adminEnrollTrain/enroll', function(req, res) {
        AdminEnrollTrain.getByStudentAndClass(req.body.studentId, req.body.trainId)
            .then(function(enrollTrain) {
                if (enrollTrain) {
                    res.jsonp({ error: "你已经报过名了，此课程不允许多次报名" });
                    return;
                }

                TrainClass.enroll(req.body.trainId)
                    .then(function(trainClass) {
                        if (trainClass && trainClass.ok && trainClass.nModified == 1) {
                            //报名成功
                            var adminEnrollTrain = new AdminEnrollTrain({
                                studentId: req.body.studentId,
                                studentName: req.body.studentName,
                                mobile: req.body.mobile,
                                trainId: req.body.trainId,
                                trainName: req.body.trainName,
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
                                    res.jsonp({ sucess: true });
                                    return;
                                });
                        } else {
                            //报名失败
                            res.jsonp({ error: "报名失败,很可能报满" });
                            return;
                        }
                    });
            });

    });

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
                    });
                } else {
                    res.jsonp({ error: "取消失败" });
                    return;
                }
            });
    });

    app.post('/admin/adminEnrollTrain/rebate', checkLogin);
    app.post('/admin/adminEnrollTrain/rebate', function(req, res) {
        AdminEnrollTrain.rebate(req.body.Id, req.body.price)
            .then(function(adminEnrollTrain) {
                if (adminEnrollTrain && adminEnrollTrain.ok && adminEnrollTrain.nModified == 1) {
                    var rebateEnrollTrain = new RebateEnrollTrain({
                        trainOrderId: req.body.Id,
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

                TrainClass.enroll(req.body.trainId)
                    .then(function(trainClass) {
                        if (trainClass && trainClass.ok && trainClass.nModified == 1) {
                            //报名成功
                            var adminEnrollTrain = new AdminEnrollTrain({
                                studentId: req.body.studentId,
                                studentName: req.body.studentName,
                                mobile: req.body.mobile,
                                trainId: req.body.trainId,
                                trainName: req.body.trainName,
                                trainPrice: req.body.trainPrice,
                                materialPrice: req.body.materialPrice,
                                discount: req.body.discount,
                                totalPrice: req.body.totalPrice,
                                fromId: req.body.oldTrainId,
                                comment: req.body.comment
                            });
                            return adminEnrollTrain.save();
                        } else {
                            //报名失败
                            res.jsonp({ error: "报名失败,很可能报满" });
                            return Promise.reject();
                        }
                    })
                    .then(function(trainClass) {
                        if (trainClass) {
                            return TrainClass.cancel(req.body.oldTrainId);
                        } else {
                            res.jsonp({ error: "报名订单保存失败" });
                            return Promise.reject();
                        }
                    })
                    .then(function(trainClass) {
                        if (trainClass && trainClass.ok && trainClass.nModified == 1) {
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
                    user: req.session.user,
                    order: order
                });
            })

    });
}