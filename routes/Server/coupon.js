var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Coupon = model.coupon,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/couponList', checkLogin);
    app.get('/admin/couponList', function (req, res) {
        res.render('Server/couponList.html', {
            title: '>优惠设置',
            user: req.session.admin
        });
    });

    app.post('/admin/coupon/add', checkLogin);
    app.post('/admin/coupon/add', function (req, res) {
        Coupon.create({
                name: req.body.name,
                category: req.body.category,
                categoryName: req.body.categoryName,
                couponStartDate: req.body.couponStartDate,
                couponEndDate: req.body.couponEndDate,
                gradeId: req.body.gradeId,
                gradeName: req.body.gradeName,
                subjectId: req.body.subjectId,
                subjectName: req.body.subjectName,
                reducePrice: req.body.reducePrice,
                reduceMax: req.body.reduceMax
            })
            .then(function (coupon) {
                res.jsonp(coupon);
            });
    });

    app.post('/admin/coupon/edit', checkLogin);
    app.post('/admin/coupon/edit', function (req, res) {
        Coupon.update({
            name: req.body.name,
            category: req.body.category,
            categoryName: req.body.categoryName,
            couponStartDate: req.body.couponStartDate,
            couponEndDate: req.body.couponEndDate,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName,
            subjectId: req.body.subjectId,
            subjectName: req.body.subjectName,
            reducePrice: req.body.reducePrice,
            reduceMax: req.body.reduceMax
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (coupon) {
            res.jsonp(coupon);
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