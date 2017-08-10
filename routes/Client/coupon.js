var CouponAssign = require('../../models/couponAssign.js'),
    Coupon = require('../../models/coupon.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    Random = require('../../util/random.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function (app) {
    app.post('/coupon/isRandomCouponExist', checkJSONLogin);
    app.post('/coupon/isRandomCouponExist', function (req, res) {
        var filter = {
            category: "随机",
            isPublished: true
        };
        Coupon.getFilter(filter)
            .then(function (result) {
                if (result) {
                    res.jsonp({
                        sucess: true
                    });
                } else {
                    res.jsonp({});
                }
            });

    });

    app.post('/personalCenter/coupon/all', checkJSONLogin);
    app.post('/personalCenter/coupon/all', function (req, res) {
        var currentUser = req.session.user;
        StudentInfo.getFilters({
            accountId: currentUser._id
        }).then(function (students) {
            var now = new Date((new Date()).toLocaleDateString());
            if (students.length <= 0) {
                res.jsonp([]);
                return;
            }
            var coupons = [],
                parray = [];
            students.forEach(function (student) {
                var filter = {
                    studentId: student._id,
                    isUsed: {
                        $ne: true
                    },
                    couponEndDate: {
                        $gte: now
                    }
                };
                var p = CouponAssign.getAllWithoutPage(filter)
                    .then(function (assigns) {
                        assigns.forEach(function (assign) {
                            coupons.push({
                                studentName: student.name,
                                couponName: assign.couponName
                            });
                        });
                    });
                parray.push(p);
            });
            Promise.all(parray).then(function () {
                res.jsonp(coupons);
                return;
            });
        });
    });

    app.post('/personalCenter/randomCoupon/all', checkJSONLogin);
    app.post('/personalCenter/randomCoupon/all', function (req, res) {
        var currentUser = req.session.user;
        var now = new Date((new Date()).toLocaleDateString());
        var filter = {
            category: "随机",
            isPublished: true,
            couponEndDate: {
                $gte: now
            }
        };
        Coupon.getFilters(filter)
            .then(function (coupons) {
                res.jsonp(coupons);
                return;
            });
    });

    app.post('/personalCenter/randomCoupon/get', checkJSONLogin);
    app.post('/personalCenter/randomCoupon/get', function (req, res) {
        var currentUser = req.session.user;
        StudentInfo.getFilters({
            accountId: currentUser._id
        }).then(function (students) {
            if (students.length <= 0) {
                res.jsonp({
                    error: "您账号下还没有任何学生！"
                });
                return;
            }
            var filter = {
                category: "随机",
                isPublished: true,
                _id: req.body.id
            };
            Coupon.getFilter(filter)
                .then(function (coupon) {
                    if (coupon) {
                        var parray = [];
                        students.forEach(function (student) {
                            var p = CouponAssign.getFilter({
                                couponId: coupon._id,
                                studentId: student._id
                            }).then(function (assign) {
                                if (!assign) {
                                    var reducePrice = Random(coupon.reducePrice, coupon.reduceMax);
                                    var couponAssign = new CouponAssign({
                                        couponId: coupon._id,
                                        couponName: coupon.name + reducePrice,
                                        gradeId: coupon.gradeId,
                                        gradeName: coupon.gradeName,
                                        subjectId: coupon.subjectId,
                                        subjectName: coupon.subjectName,
                                        reducePrice: reducePrice,
                                        couponStartDate: coupon.couponStartDate,
                                        couponEndDate: coupon.couponEndDate,
                                        studentId: student._id,
                                        studentName: student.name,
                                        createdBy: req.session.user._id
                                    });
                                    return couponAssign.save();
                                }
                            });

                            parray.push(p);
                        });
                        Promise.all(parray).then(function () {
                            res.jsonp({
                                sucess: true
                            });
                            return;
                        }).catch(function (err) {
                            res.jsonp({
                                error: err
                            });
                            return;
                        });
                    } else {
                        res.jsonp({
                            error: "找不到该优惠券了！"
                        });
                        return;
                    }
                });
        });
    });

}