var Lession = require('../../models/lession.js'),
    Book = require('../../models/book.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/book/:id', checkLogin);
    app.get('/admin/book/:id', function (req, res) {
        Book.get(req.params.id)
            .then(function (book) {
                if (book) {
                    res.render('Server/lessionList.html', {
                        title: '>课文列表',
                        user: req.session.admin,
                        book: book
                    });
                }
            }).catch(function () {
                res.render("404.html");
            });
    });
    app.get('/admin/lession/:id', checkLogin);
    app.get('/admin/lession/:id', function (req, res) {
        Lession.get(req.params.id)
            .then(function (lession) {
                if (lession) {
                    res.render('Server/lessionDetail.html', {
                        title: '>课文内容',
                        user: req.session.admin,
                        lession: lession
                    });
                }
            }).catch(function () {
                res.render("404.html");
            });
    });

    app.post('/admin/lession/add', checkLogin);
    app.post('/admin/lession/add', function (req, res) {
        var lession = new Lession({
            bookId: req.body.bookId,
            name: req.body.name,
            sequence: req.body.sequence,
            createdBy: req.session.admin._id
        });

        lession.save().then(function (result) {
            if (result) {
                res.jsonp(lession);
            }
        });
    });

    app.post('/admin/lession/edit', checkLogin);
    app.post('/admin/lession/edit', function (req, res) {
        var lession = new Lession({
            name: req.body.name,
            sequence: req.body.sequence
        });

        lession.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lession/delete', checkLogin);
    app.post('/admin/lession/delete', function (req, res) {
        Lession.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/lessionList/search', checkLogin);
    app.post('/admin/lessionList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.bookId) {
            filter.bookId = req.body.bookId;
        }

        if (req.body.name) {
            var reg = new RegExp(req.body.name, 'i')
            filter.name = {
                $regex: reg
            };
        }

        Lession.getAll(null, page, filter, function (err, lessions, total) {
            if (err) {
                lessions = [];
            }
            res.jsonp({
                lessions: lessions,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + lessions.length) == total
            });
        });
    });
}