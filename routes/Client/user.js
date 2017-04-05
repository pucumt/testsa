var StudentInfo = require('../../models/studentInfo.js'),
    CouponAssign = require('../../models/couponAssign.js'),
    TrainClass = require('../../models/trainClass.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function(app) {
    app.post('/studentInfo/add', checkJSONLogin);
    app.post('/studentInfo/add', function(req, res) {
        var studentInfo = new StudentInfo({
            name: req.body.name,
            address: req.body.address,
            mobile: req.body.mobile,
            sex: req.body.sex,
            School: req.body.School,
            address: req.body.address,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName,
            accountId: req.session.user._id
        });

        studentInfo.save()
            .then(function(student) {
                res.jsonp({ student: student });
            });
    });

    app.post('/studentInfo/edit', checkJSONLogin);
    app.post('/studentInfo/edit', function(req, res) {
        var studentInfo = new StudentInfo({
            name: req.body.name,
            address: req.body.address,
            mobile: req.body.mobile,
            sex: req.body.sex,
            School: req.body.School,
            address: req.body.address,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName
        });

        studentInfo.update(req.body.id, function(err, result) {
            if (err) {
                studentInfo = {};
            }
            res.jsonp({ succeed: true });
        });
    });

    app.post('/studentInfo/coupon', checkJSONLogin);
    app.post('/studentInfo/coupon', function(req, res) {
        TrainClass.get(req.body.classId).then(function(trainClass) {
            StudentInfo.get(req.body.studentId).then(function(student) {
                var now = new Date((new Date()).toLocaleDateString());
                var filter = {
                    studentId: req.body.studentId,
                    gradeId: trainClass.gradeId,
                    subjectId: trainClass.subjectId,
                    isUsed: { $ne: true },
                    couponEndDate: { $gte: now }
                };
                CouponAssign.getAllWithoutPage(filter).then(function(assigns) {
                    res.jsonp({
                        student: student,
                        assigns: assigns
                    });
                });
            });
        });
    });
}