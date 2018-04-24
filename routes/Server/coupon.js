var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Coupon = model.coupon,
    CouponSubject = model.couponSubject,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/couponList', checkLogin);
    app.get('/admin/couponList', auth.checkSecure([0, 7]));
    app.get('/admin/couponList', function (req, res) {
        res.render('Server/couponList.html', {
            title: '>优惠设置',
            user: req.session.admin
        });
    });

    app.post('/admin/coupon/add', checkLogin);
    app.post('/admin/coupon/add', function (req, res) {
        model.db.sequelize.transaction(function (t1) {
                Coupon.create({
                        name: req.body.name,
                        category: req.body.category,
                        categoryName: req.body.categoryName,
                        couponStartDate: req.body.couponStartDate,
                        couponEndDate: req.body.couponEndDate,
                        reducePrice: req.body.reducePrice,
                        reduceMax: req.body.reduceMax,
                        createdBy: req.session.admin._id
                    }, {
                        transaction: t1
                    })
                    .then(function (coupon) {
                        var subjects = (req.body.subjects ? JSON.parse(req.body.subjects) : []),
                            p;
                        if (subjects.length > 0) {
                            subjects.forEach(function (subject) {
                                subject.CouponId = coupon._id;
                                subject._id = model.db.generateId();
                            });
                            return CouponSubject.bulkCreate(subjects, {
                                transaction: t1
                            });
                        }
                    });
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function () {
                res.jsonp({
                    error: "添加失败"
                });
            });
    });

    app.post('/admin/coupon/edit', checkLogin);
    app.post('/admin/coupon/edit', function (req, res) {
        var subjects = (req.body.subjects ? JSON.parse(req.body.subjects) : []),
            toCreateSubjects = [],
            toDeleteSubjectIds = [];
        var p = CouponSubject.getFilters({
                CouponId: req.body.id
            })
            .then(orgSubjects => {
                subjects.forEach(subject => {
                    if (!orgSubjects.some(orgSubject => {
                            return orgSubject.subjectId == subject.subjectId;
                        })) {
                        // 原来没有的科目
                        subject._id = model.db.generateId();
                        subject.CouponId = req.body.id;
                        toCreateSubjects.push(subject);
                    }
                });
                orgSubjects.forEach(orgSubject => {
                    if (!subjects.some(subject => {
                            return orgSubject.subjectId == subject.subjectId;
                        })) {
                        // 要被删除的科目
                        toDeleteSubjectIds.push(orgSubject._id);
                    }
                });
            });

        p.then(function () {
            model.db.sequelize.transaction(function (t1) {
                    return Coupon.update({
                            name: req.body.name,
                            category: req.body.category,
                            categoryName: req.body.categoryName,
                            couponStartDate: req.body.couponStartDate,
                            couponEndDate: req.body.couponEndDate,
                            reducePrice: req.body.reducePrice,
                            reduceMax: req.body.reduceMax
                        }, {
                            where: {
                                _id: req.body.id
                            },
                            transaction: t1
                        })
                        .then(function (resultExam) {
                            // 科目
                            var pArray = [];
                            if (toCreateSubjects.length > 0) {
                                var p = CouponSubject.bulkCreate(toCreateSubjects, {
                                    transaction: t1
                                });
                                pArray.push(p);
                            }
                            if (toDeleteSubjectIds.length > 0) {
                                var p = CouponSubject.update({
                                    isDeleted: true,
                                    deletedBy: req.session.admin._id,
                                    deletedDate: new Date()
                                }, {
                                    where: {
                                        _id: {
                                            $in: toDeleteSubjectIds
                                        }
                                    },
                                    transaction: t1
                                });
                                pArray.push(p);
                            }
                            return Promise.all(pArray);
                        });
                })
                .then(function (result) {
                    res.jsonp({
                        sucess: true
                    });
                })
                .catch(function () {
                    res.jsonp({
                        error: "修改失败"
                    });
                });
        });
    });

    app.post('/admin/coupon/delete', checkLogin);
    app.post('/admin/coupon/delete', function (req, res) {
        Coupon.update({
            isDeleted: true,
            deletedBy: req.session.admin._id,
            deletedDate: new Date()
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/couponList/search', checkLogin);
    app.post('/admin/couponList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        Coupon.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                coupons: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/coupon/publish', checkLogin);
    app.post('/admin/coupon/publish', function (req, res) {
        Coupon.update({
            isPublished: true
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/coupon/unpublish', checkLogin);
    app.post('/admin/coupon/unpublish', function (req, res) {
        Coupon.update({
            isPublished: false
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

}