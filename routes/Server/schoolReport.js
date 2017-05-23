var AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    SchoolArea = require('../../models/schoolArea.js'),
    TrainClass = require('../../models/trainClass.js'),
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

    app.post('/admin/schoolReportList/search', checkLogin);
    app.post('/admin/schoolReportList/search', function(req, res) {
        var list = [];
        SchoolArea.getFilters({}).then(function(schools) {
            var pArray = [];
            schools.forEach(function(school) {
                var p = TrainClass.getFilters({ schoolId: school._id })
                    .then(function(trainClasses) {
                        if (trainClasses && trainClasses.length > 0) {
                            var classIds = trainClasses.map(function(singleClass) {
                                return singleClass._id;
                            });
                            return AdminEnrollTrain.getFilters({
                                trainId: { $in: classIds },
                                orderDate: { $lte: req.body.endDate },
                                orderDate: { $gte: req.body.startDate },
                                isSucceed: 1,
                                isPayed: true
                            }).then(function(orders) {
                                var trainPrice = 0,
                                    materialPrice = 0;
                                orders.forEach(function(order) {
                                    trainPrice = trainPrice + order.trainPrice;
                                    materialPrice = materialPrice + order.materialPrice;
                                });

                                list.push({
                                    _id: school._id,
                                    name: school.name,
                                    trainPrice: trainPrice.toFixed(2),
                                    materialPrice: materialPrice.toFixed(2),
                                    totalPrice: (trainPrice + materialPrice).toFixed(2)
                                });
                            });
                        } else {
                            list.push({ _id: school._id, name: school.name, trainPrice: 0, materialPrice: 0, totalPrice: 0 });
                        }
                    });
                pArray.push(p);
            });
            Promise.all(pArray).then(function() {
                res.json(list);
            });
        });
    });

    app.post('/admin/payWayReportList/search', checkLogin);
    app.post('/admin/payWayReportList/search', function(req, res) {
        var list = [],
            pArray = [],
            payWays = [
                { name: "现金", value: 0 },
                { name: "刷卡", value: 1 },
                { name: "转账", value: 2 },
                { name: "支付宝扫码", value: 8 },
                { name: "微信扫码", value: 9 },
                { name: "在线支付", value: 6 }
            ];
        payWays.forEach(function(payWay) {
            var p0 = AdminEnrollTrain.getFilters({
                orderDate: { $lte: req.body.endDate },
                orderDate: { $gte: req.body.startDate },
                isSucceed: 1,
                isPayed: true,
                payWay: payWay.value
            }).then(function(orders) {
                var trainPrice = 0,
                    materialPrice = 0;
                orders.forEach(function(order) {
                    trainPrice = trainPrice + order.trainPrice;
                    materialPrice = materialPrice + order.materialPrice;
                });
                list.push({
                    name: payWay.name,
                    trainPrice: trainPrice.toFixed(2),
                    materialPrice: materialPrice.toFixed(2),
                    totalPrice: (trainPrice + materialPrice).toFixed(2)
                });
            });
            pArray.push(p0);
        });
        Promise.all(pArray).then(function() {
            res.json(list);
        });
    });

    app.post('/admin/rebateReportList/search', checkLogin);
    app.post('/admin/rebateReportList/search', function(req, res) {
        var list = [];
        SchoolArea.getFilters({}).then(function(schools) {
            var pArray = [];
            schools.forEach(function(school) {
                var p = TrainClass.getFilters({ schoolId: school._id })
                    .then(function(trainClasses) {
                        if (trainClasses && trainClasses.length > 0) {
                            var classIds = trainClasses.map(function(singleClass) {
                                return singleClass._id;
                            });
                            return AdminEnrollTrain.getFilters({
                                trainId: { $in: classIds },
                                orderDate: { $lte: req.body.endDate },
                                orderDate: { $gte: req.body.startDate },
                                isSucceed: 1,
                                isPayed: true
                            }).then(function(orders) {
                                var trainPrice = 0,
                                    materialPrice = 0;
                                orders.forEach(function(order) {
                                    trainPrice = trainPrice + order.trainPrice;
                                    materialPrice = materialPrice + order.materialPrice;
                                });

                                list.push({
                                    _id: school._id,
                                    name: school.name,
                                    trainPrice: trainPrice.toFixed(2),
                                    materialPrice: materialPrice.toFixed(2),
                                    totalPrice: (trainPrice + materialPrice).toFixed(2)
                                });
                            });
                        } else {
                            list.push({ _id: school._id, name: school.name, trainPrice: 0, materialPrice: 0, totalPrice: 0 });
                        }
                    });
                pArray.push(p);
            });
            Promise.all(pArray).then(function() {
                res.json(list);
            });
        });
    });
}