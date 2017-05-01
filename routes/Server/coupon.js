var Coupon = require('../../models/coupon.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/couponList', checkLogin);
    app.get('/admin/couponList', function(req, res) {
        res.render('Server/couponList.html', {
            title: '>优惠设置',
            user: req.session.admin
        });
    });

    app.post('/admin/coupon/add', checkLogin);
    app.post('/admin/coupon/add', function(req, res) {
        var coupon = new Coupon({
            name: req.body.name,
            category: req.body.category,
            couponStartDate: req.body.couponStartDate,
            couponEndDate: req.body.couponEndDate,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName,
            subjectId: req.body.subjectId,
            subjectName: req.body.subjectName,
            reducePrice: req.body.reducePrice,
            reduceMax: req.body.reduceMax
        });

        coupon.save(function(err, coupon) {
            if (err) {
                coupon = {};
            }
            res.jsonp(coupon);
        });
    });

    app.post('/admin/coupon/edit', checkLogin);
    app.post('/admin/coupon/edit', function(req, res) {
        var coupon = new Coupon({
            name: req.body.name,
            category: req.body.category,
            couponStartDate: req.body.couponStartDate,
            couponEndDate: req.body.couponEndDate,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName,
            subjectId: req.body.subjectId,
            subjectName: req.body.subjectName,
            reducePrice: req.body.reducePrice,
            reduceMax: req.body.reduceMax
        });

        coupon.update(req.body.id, function(err, coupon) {
            if (err) {
                coupon = {};
            }
            res.jsonp(coupon);
        });
    });

    app.post('/admin/coupon/delete', checkLogin);
    app.post('/admin/coupon/delete', function(req, res) {
        Coupon.delete(req.body.id, function(err, coupon) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/couponList/search', checkLogin);
    app.post('/admin/couponList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name) {
            var reg = new RegExp(req.body.name, 'i')
            filter.name = {
                $regex: reg
            };
        }

        Coupon.getAll(null, page, filter, function(err, coupons, total) {
            if (err) {
                coupons = [];
            }
            res.jsonp({
                coupons: coupons,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + coupons.length) == total
            });
        });
    });

    app.post('/admin/coupon/publish', checkLogin);
    app.post('/admin/coupon/publish', function(req, res) {
        Coupon.publish(req.body.id, function(err, coupon) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/coupon/unpublish', checkLogin);
    app.post('/admin/coupon/unpublish', function(req, res) {
        Coupon.unpublish(req.body.id, function(err, coupon) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

}