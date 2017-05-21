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
                                orderDate: { $gte: req.body.startDate }
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