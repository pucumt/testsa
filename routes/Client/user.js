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

    app.get('/personalCenter/students', checkLogin);
    app.get('/personalCenter/students', function(req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_students.html', {
            title: '学生列表',
            user: req.session.user
        });
    });

    app.get('/personalCenter/coupon', checkLogin);
    app.get('/personalCenter/coupon', function(req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_coupon.html', {
            title: '优惠券列表',
            user: req.session.user
        });
    });

    app.get('/personalCenter/order', checkLogin);
    app.get('/personalCenter/order', function(req, res) {
        var currentUser = req.session.user;
        res.render('Client/personalCenter_order.html', {
            title: '订单列表',
            user: req.session.user
        });
    });

    app.get('/personalCenter/coupon/all', checkJSONLogin);
    app.get('/personalCenter/coupon/all', function(req, res) {
        var currentUser = req.session.user;
        StudentInfo.getFilters({ accountId: currentUser._id }).then(function(students) {
            var now = new Date((new Date()).toLocaleDateString());
            if (students.length <= 0) {
                res.jsonp([]);
                return;
            }
            var coupons = [],
                parray = [];
            students.forEach(function(student) {
                var filter = {
                    studentId: student._id,
                    isUsed: { $ne: true },
                    couponEndDate: { $gte: now }
                };
                var p = CouponAssign.getAllWithoutPage(filter)
                    .then(function(assigns) {
                        assigns.forEach(function(assign) {
                            coupons.push({ studentName: student.name, couponName: assign.couponName });
                        });
                    });
                parray.push(p);
            });
            Promise.all(parray).then(function() {
                res.jsonp(coupons);
                return;
            });
        });
    });
}