var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    CouponAssign = model.couponAssign,
    Coupon = model.coupon,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/couponAssign/:id', checkLogin);
    app.get('/admin/couponAssign/:id', function (req, res) {
        Coupon.getFilter({
                _id: req.params.id
            })
            .then(function (coupon) {
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
        return {
            couponId: coupon.couponId,
            couponName: coupon.couponName,
            gradeId: coupon.gradeId,
            gradeName: coupon.gradeName,
            subjectId: coupon.subjectId,
            subjectName: coupon.subjectName,
            reducePrice: coupon.reducePrice,
            couponStartDate: coupon.couponStartDate,
            couponEndDate: coupon.couponEndDate,
            accountId: student.accountId,
            mobile: student.mobile,
            createdBy: admin._id
        };
    };

    app.post('/admin/couponAssign/assign', checkLogin);
    app.post('/admin/couponAssign/assign', function (req, res) {
        var students = JSON.parse(req.body.accounts);
        var coupon = JSON.parse(req.body.coupon);

        var pArray = [];
        students.forEach(function (student) {
            var p = CouponAssign.getFilter({
                    couponId: coupon.couponId,
                    accountId: student.accountId
                })
                .then(function (assign) {
                    if (assign) {
                        if (!student.checked) {
                            // delete
                            return CouponAssign.update({
                                isDeleted: true,
                                deletedBy: req.session.admin._id,
                                deletedDate: new Date()
                            }, {
                                where: {
                                    _id: assign._id
                                }
                            });
                        }
                    } else {
                        if (student.checked) {
                            // add
                            var couponAssign = newCouponAssign(coupon, student, req.session.admin);
                            return CouponAssign.create(couponAssign);
                        }
                    }
                });
            pArray.push(p);
        });

        Promise.all(pArray)
            .then(function (order) {
                res.jsonp({
                    sucess: true
                });
            }).catch(function (err) {
                res.jsonp({
                    error: "分配失败"
                });
            });
    });


    app.post('/admin/couponAssign/delete', checkLogin);
    app.post('/admin/couponAssign/delete', function (req, res) {
        CouponAssign.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
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
        if (req.body.gradeId) {
            filter.gradeId = req.body.gradeId;
        }
        if (req.body.subjectId) {
            filter.subjectId = req.body.subjectId;
        }
        if (req.body.name) {
            filter.mobile = req.body.name;
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

    app.post('/admin/couponAssignList/withoutpage/onlyaccountId', checkLogin);
    app.post('/admin/couponAssignList/withoutpage/onlyaccountId', function (req, res) {
        var filter = {
            isDeleted: false
        };
        if (req.body.couponId) {
            filter.couponId = req.body.couponId;
        }

        CouponAssign.findAll({
            where: filter,
            attributes: ['accountId']
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
        Coupon.getFilter({
                _id: req.params.id
            })
            .then(function (coupon) {
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
        CouponAssign.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    couponId: req.body.couponId,
                    _id: {
                        $gt: req.body.id
                    }
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });
}