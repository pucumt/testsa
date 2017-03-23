var AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    TrainClass = require('../../models/trainClass.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

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
                                isSucceed: 1
                            });
                            adminEnrollTrain.save()
                                .then(function(enrollExam) {
                                    res.jsonp({ sucess: true });
                                    return;
                                });
                        } else {
                            //报名失败
                            res.jsonp({ error: "报名失败,很可能以报满" });
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
}