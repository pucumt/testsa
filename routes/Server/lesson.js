var Lesson = require('../../models/lesson.js'),
    Book = require('../../models/book.js'),
    auth = require("./auth"),
    LessonWord = require('../../models/lessonWord.js'),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/book/:id', checkLogin);
    app.get('/admin/book/:id', function (req, res) {
        Book.get(req.params.id)
            .then(function (book) {
                if (book) {
                    res.render('Server/lessonList.html', {
                        title: '>课文列表',
                        user: req.session.admin,
                        book: book
                    });
                }
            }).catch(function () {
                res.render("404.html");
            });
    });
    app.get('/admin/lesson/:id', checkLogin);
    app.get('/admin/lesson/:id', function (req, res) {
        Lesson.get(req.params.id)
            .then(function (lesson) {
                if (lesson) {
                    res.render('Server/lessonDetail.html', {
                        title: '>课文内容',
                        user: req.session.admin,
                        lesson: lesson
                    });
                }
            }).catch(function () {
                res.render("404.html");
            });
    });

    app.post('/admin/lesson/add', checkLogin);
    app.post('/admin/lesson/add', function (req, res) {
        var lesson = new Lesson({
            bookId: req.body.bookId,
            name: req.body.name,
            sequence: req.body.sequence,
            createdBy: req.session.admin._id
        });

        lesson.save().then(function (result) {
            if (result) {
                res.jsonp(lesson);
            }
        });
    });

    app.post('/admin/lesson/edit', checkLogin);
    app.post('/admin/lesson/edit', function (req, res) {
        var lesson = new Lesson({
            name: req.body.name,
            sequence: req.body.sequence
        });

        lesson.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lesson/delete', checkLogin);
    app.post('/admin/lesson/delete', function (req, res) {
        Lesson.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/lessonList/search', checkLogin);
    app.post('/admin/lessonList/search', function (req, res) {

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

        Lesson.getAll(null, page, filter, function (err, lessons, total) {
            if (err) {
                lessons = [];
            }
            res.jsonp({
                lessons: lessons,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + lessons.length) == total
            });
        });
    });
}