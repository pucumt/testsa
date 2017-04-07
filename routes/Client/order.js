var AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function(app) {
    app.get('/personalCenter/order/all', checkJSONLogin);
    app.get('/personalCenter/order/all', function(req, res) {
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
}