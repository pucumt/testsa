var CouponAssign = require('../../models/couponAssign.js'),
    Coupon = require('../../models/coupon.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/couponAssign/:id', checkLogin);
    app.get('/admin/couponAssign/:id', function(req, res) {
        Coupon.get(req.params.id).then(function(coupon) {
            if (coupon) {
                res.render('Server/couponAssign.html', {
                    title: '>优惠券分配',
                    user: req.session.user,
                    coupon: coupon
                });
            }
        });
    });

    function newCouponAssign(coupon, student) {
        var couponAssign = new CouponAssign({
            couponId: coupon.couponId,
            couponName: coupon.couponName,
            gradeId: coupon.gradeId,
            gradeName: coupon.gradeName,
            subjectId: coupon.subjectId,
            subjectName: coupon.subjectName,
            reducePrice: coupon.reducePrice,
            couponStartDate: coupon.couponStartDate,
            couponEndDate: coupon.couponEndDate,
            studentId: student.studentId
        });
        return couponAssign;
    };

    app.post('/admin/couponAssign/assign', checkLogin);
    app.post('/admin/couponAssign/assign', function(req, res) {
        var students = JSON.parse(req.body.students);
        var coupon = JSON.parse(req.body.coupon);

        students.forEach(function(student) {
            CouponAssign.getFilter({ couponId: coupon.couponId, studentId: student.studentId })
                .then(function(assign) {
                    if (assign) {
                        if (student.checked) {
                            //update
                            var couponAssign = newCouponAssign(coupon, student);
                            couponAssign.update(assign._id, function(err, couponAssign) {
                                if (err) {
                                    couponAssign = {};
                                }
                            });
                        } else {
                            //delete
                            CouponAssign.delete(assign._id, function(err, couponAssign) {
                                if (err) {
                                    res.jsonp({ error: err });
                                    return;
                                }
                            });
                        }
                    } else {
                        if (student.checked) {
                            //add
                            var couponAssign = newCouponAssign(coupon, student);
                            couponAssign.save(function(err, couponAssign) {
                                if (err) {
                                    couponAssign = {};
                                }
                            });
                        }
                    }
                });
        });

        res.jsonp({ sucess: true });
    });

    app.post('/admin/couponAssign/edit', checkLogin);
    app.post('/admin/couponAssign/edit', function(req, res) {
        var couponAssign = new CouponAssign({
            name: req.body.name,
            address: req.body.address
        });

        couponAssign.update(req.body.id, function(err, couponAssign) {
            if (err) {
                couponAssign = {};
            }
            res.jsonp(couponAssign);
        });
    });

    app.post('/admin/couponAssign/delete', checkLogin);
    app.post('/admin/couponAssign/delete', function(req, res) {
        CouponAssign.delete(req.body.id, function(err, couponAssign) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/couponAssignList/search', checkLogin);
    app.post('/admin/couponAssignList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
        }
        if (req.body.gradeId) {
            filter.gradeId = req.body.gradeId;
        }
        if (req.body.subjectId) {
            filter.subjectId = req.body.subjectId;
        }

        CouponAssign.getAll(null, page, filter, function(err, couponAssigns, total) {
            if (err) {
                couponAssigns = [];
            }
            res.jsonp({
                couponAssigns: couponAssigns,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + couponAssigns.length) == total
            });
        });
    });

    app.post('/admin/couponAssignList/withoutpage/onlystudentId', checkLogin);
    app.post('/admin/couponAssignList/withoutpage/onlystudentId', function(req, res) {
        var filter = {};
        if (req.body.couponId) {
            filter.couponId = req.body.couponId;
        }
        CouponAssign.getAllStudentIdWithoutPage(filter, function(err, couponAssigns) {
            res.jsonp(couponAssigns);
        });
    });

    app.post('/admin/couponAssignList/searchUseful', checkLogin);
    app.post('/admin/couponAssignList/searchUseful', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
        }
        if (req.body.gradeId) {
            filter.gradeId = req.body.gradeId;
        }
        if (req.body.subjectId) {
            filter.subjectId = req.body.subjectId;
        }
        filter.isUsed = false;
        var now = new Date((new Date()).toLocaleDateString());
        filter.couponStartDate = { $lte: now };
        filter.couponEndDate = { $gte: now };

        CouponAssign.getAll(null, page, filter, function(err, couponAssigns, total) {
            if (err) {
                couponAssigns = [];
            }
            res.jsonp({
                couponAssigns: couponAssigns,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + couponAssigns.length) == total
            });
        });
    });
}