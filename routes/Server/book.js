var Book = require('../../models/book.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/adminBookList', checkLogin);
    app.get('/admin/adminBookList', function (req, res) {
        res.render('Server/bookList.html', {
            title: '>课本列表',
            user: req.session.admin
        });
    });

    app.post('/admin/book/add', checkLogin);
    app.post('/admin/book/add', function (req, res) {
        Book.getFilter({
                name: req.body.name
            })
            .then(function (book) {
                if (book) {
                    res.jsonp({
                        error: "同名课本已经存在！"
                    });
                } else {
                    var book = new Book({
                        name: req.body.name,
                        sequence: req.body.sequence,
                        createdBy: req.session.admin._id
                    });

                    book.save().then(function (result) {
                        if (result) {
                            res.jsonp(book);
                        }
                    });
                }
            });
    });

    app.post('/admin/book/edit', checkLogin);
    app.post('/admin/book/edit', function (req, res) {
        Book.getFilter({
                name: req.body.name,
                _id: {
                    $ne: req.body.id
                }
            })
            .then(function (book) {
                if (book) {
                    res.jsonp({
                        error: "同名课本已经存在！"
                    });
                } else {
                    var book = new Book({
                        name: req.body.name,
                        sequence: req.body.sequence
                    });

                    book.update(req.body.id)
                        .then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        });
                }
            });
    });

    app.post('/admin/book/delete', checkLogin);
    app.post('/admin/book/delete', function (req, res) {
        Book.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/bookList/search', checkLogin);
    app.post('/admin/bookList/search', function (req, res) {

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

        Book.getAll(null, page, filter, function (err, books, total) {
            if (err) {
                books = [];
            }
            res.jsonp({
                books: books,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + books.length) == total
            });
        });
    });
}