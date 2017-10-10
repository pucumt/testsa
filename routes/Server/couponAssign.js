var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    CouponAssign = model.couponAssign,
    Coupon = model.coupon,
    auth = require("./auth"),
    checkLogin = auth.checkLogin; // TBD

module.exports = function (app) {
    app.get('/admin/couponAssign/:id', checkLogin);
    app.get('/admin/couponAssign/:id', function (req, res) {
        Coupon.getFilter({
            _id: req.params.id
        }).then(function (coupon) {
            if (coupon) {
                res.render('Server/couponAssign.html', {
                    title: '>优惠券分配',
                    user: req.session.admin,
                    coupon: coupon
                });
            }
        });
    });

    app.get('/admin/couponAssignList/:id', checkLogin);
    app.get('/admin/couponAssignList/:id', function (req, res) {
        res.render('Server/couponAssignList.html', {
            title: '>优惠券已分配',
            user: req.session.admin,
            couponId: req.params.id
        });
    });

    function newCouponAssign(coupon, student, admin) {
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
            studentId: student.studentId,
            studentName: student.studentName,
            createdBy: admin._id
        });
        return couponAssign;
    };

    app.post('/admin/couponAssign/assign', checkLogin);
    app.post('/admin/couponAssign/assign', function (req, res) {
        var students = JSON.parse(req.body.students);
        var coupon = JSON.parse(req.body.coupon);

        students.forEach(function (student) {
            CouponAssign.getFilter({
                    couponId: coupon.couponId,
                    studentId: student.studentId
                })
                .then(function (assign) {
                    if (assign) {
                        if (student.checked) {
                            //update
                            var couponAssign = newCouponAssign(coupon, student, req.session.admin);
                            couponAssign.update(assign._id, function (err, couponAssign) {
                                if (err) {
                                    couponAssign = {};
                                }
                            });
                        } else {
                            //delete
                            CouponAssign.delete(assign._id, req.session.admin._id, function (err, couponAssign) {
                                if (err) {
                                    res.jsonp({
                                        error: err
                                    });
                                    return;
                                }
                            });
                        }
                    } else {
                        if (student.checked) {
                            //add
                            var couponAssign = newCouponAssign(coupon, student, req.session.admin);
                            couponAssign.save();
                        }
                    }
                });
        });

        res.jsonp({
            sucess: true
        });
    });

    app.post('/admin/couponAssign/edit', checkLogin);
    app.post('/admin/couponAssign/edit', function (req, res) {
        var couponAssign = new CouponAssign({
            name: req.body.name,
            address: req.body.address
        });

        couponAssign.update(req.body.id, function (err, couponAssign) {
            if (err) {
                couponAssign = {};
            }
            res.jsonp(couponAssign);
        });
    });

    app.post('/admin/couponAssign/delete', checkLogin);
    app.post('/admin/couponAssign/delete', function (req, res) {

        CouponAssign.delete(req.body.id, req.session.admin._id, function (err, couponAssign) {
            if (err) {
                res.jsonp({
                    error: err
                });
                return;
            }
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/couponAssignList/search', checkLogin);
    app.post('/admin/couponAssignList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.couponId) {
            filter.couponId = req.body.couponId;
        }
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
        }
        if (req.body.gradeId) {
            filter.gradeId = req.body.gradeId;
        }
        if (req.body.subjectId) {
            filter.subjectId = req.body.subjectId;
        }
        if (req.body.name) {
            filter.studentName = req.body.name;
        }
        CouponAssign.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                couponAssigns: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/couponAssignList/withoutpage/onlystudentId', checkLogin);
    app.post('/admin/couponAssignList/withoutpage/onlystudentId', function (req, res) {
        var filter = {
            isDeleted: false
        };
        if (req.body.couponId) {
            filter.couponId = req.body.couponId;
        }

        CouponAssign.findAll({
            where: filter,
            attributes: ['studentId']
        }).then(function (couponAssigns) {
            res.jsonp(couponAssigns);
        });
    });

    app.post('/admin/couponAssignList/searchUseful', checkLogin);
    app.post('/admin/couponAssignList/searchUseful', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
        }
        if (req.body.gradeId) {
            filter.gradeId = {
                $in: [req.body.gradeId, ""]
            };
        }
        if (req.body.subjectId) {
            filter.subjectId = {
                $in: [req.body.subjectId, ""]
            };
        }
        filter.isUsed = false;
        var now = new Date((new Date()).toLocaleDateString());
        filter.couponStartDate = {
            $lte: now
        };
        filter.couponEndDate = {
            $gte: now
        };

        CouponAssign.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                couponAssigns: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.get('/admin/couponAssign/batchAssign/:id', checkLogin);
    app.get('/admin/couponAssign/batchAssign/:id', function (req, res) {
        Coupon.get(req.params.id).then(function (coupon) {
            if (coupon) {
                res.render('Server/couponBatchAssign.html', {
                    title: '>优惠券分配',
                    user: req.session.admin,
                    coupon: coupon
                });
            }
        });
    });

    app.post('/admin/coupon/batchDeleteGtIds', checkLogin);
    app.post('/admin/coupon/batchDeleteGtIds', function (req, res) {
        CouponAssign.batchUpdate({
                couponId: req.body.couponId,
                _id: {
                    $gt: req.body.id
                }
            }, {
                isDeleted: true
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });
}