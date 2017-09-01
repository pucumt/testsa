var Lesson = require('../../models/lesson.js'),
    Book = require('../../models/book.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    LessonContent = require('../../models/lessonContent.js'),
    StudentLesson = require('../../models/studentLesson.js'),
    StudentLessonScore = require('../../models/studentLessonScore.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function (app) {
    app.get('/Teacher/book/:id', checkLogin);
    app.get('/Teacher/book/:id', function (req, res) {
        res.render('Teacher/book_lesson.html', {
            title: '课文列表',
            user: req.session.user,
            bookId: req.params.id,
            classId: req.query.classId,
            studentId: req.query.studentId
        });
    });

    app.post('/Teacher/book/lessons', checkLogin);
    app.post('/Teacher/book/lessons', function (req, res) {
        //debugger;
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var filter = {
            bookId: req.body.bookId
        };
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
                isLastPage: ((page - 1) * 14 + lessons.length) == total
            });
        });
    });

    app.post('/Teacher/book/allLessons', checkLogin);
    app.post('/Teacher/book/allLessons', function (req, res) {
        //debugger;
        // number 类型
        var filter = {
            bookId: req.body.bookId
        };
        if (req.body.minLesson) {
            filter.sequence = {
                $lte: req.body.maxLesson,
                $gte: req.body.minLesson
            };
        }
        Lesson.getFilters(filter)
            .then(function (lessons) {
                res.jsonp(lessons);
            });
    });

    app.get('/Teacher/book/lesson/:id', checkLogin);
    app.get('/Teacher/book/lesson/:id', function (req, res) {
        Lesson.get(req.params.id)
            .then(function (lesson) {
                res.render('Teacher/book_lesson_detail.html', {
                    title: '课文内容',
                    user: req.session.user,
                    name: lesson.name,
                    lessonId: req.params.id,
                    classId: req.query.classId,
                    studentId: req.query.studentId,
                    bookId: lesson.bookId
                });
            });
    });

    app.post('/Teacher/book/lesson/search/content', checkLogin);
    app.post('/Teacher/book/lesson/search/content', function (req, res) {
        LessonContent.getFilters({
                lessonId: req.body.lessonId
            })
            .then(function (contents) {
                StudentLessonScore.getFilters({
                        studentId: req.body.studentId,
                        lessonId: req.body.lessonId
                    })
                    .then(function (scores) {
                        res.jsonp({
                            contents: contents,
                            scores: scores
                        });
                    });
            });
    });
}