var Lesson = require('../../models/lesson.js'),
    Book = require('../../models/book.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    LessonContent = require('../../models/lessonContent.js'),
    StudentLessonScore = require('../../models/studentLessonScore.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function (app) {
    app.get('/personalCenter/book/id/:id', checkLogin);
    app.get('/personalCenter/book/id/:id', function (req, res) {
        res.render('Client/book_lesson.html', {
            title: '课文列表',
            user: req.session.user,
            bookId: req.params.id,
            studentId: req.query.studentId
        });
    });

    app.post('/book/lessons', function (req, res) {
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

    app.get('/book/lesson/:id', checkLogin);
    app.get('/book/lesson/:id', function (req, res) {
        Lesson.get(req.params.id)
            .then(function (lesson) {
                res.render('Client/book_lesson_detail.html', {
                    title: '课文列表',
                    user: req.session.user,
                    name: lesson.name,
                    lessonId: req.params.id,
                    studentId: req.query.studentId
                });
            });
    });

    app.post('/book/lesson/search/content', checkLogin);
    app.post('/book/lesson/search/content', function (req, res) {
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

    // app.post('/book/lesson/search/sentence', checkLogin);
    // app.post('/book/lesson/search/sentence', function (req, res) {
    //     LessonContent.getFilters({
    //             lessonId: req.body.lessonId,
    //             contentType: 2
    //         })
    //         .then(function (sentences) {
    //             res.jsonp({
    //                 sentences: sentences
    //             });
    //         });
    // });

    // app.post('/book/lesson/search/content', checkLogin);
    // app.post('/book/lesson/search/content', function (req, res) {
    //     LessonContent.getFilter({
    //             lessonId: req.body.lessonId,
    //             contentType: 0
    //         })
    //         .then(function (content) {
    //             res.jsonp({
    //                 content: content
    //             });
    //         });
    // });

    app.post('/book/lesson/score', checkLogin);
    app.post('/book/lesson/score', function (req, res) {
        StudentLessonScore.getFilter({
                lessonId: req.body.lessonId,
                studentId: req.body.studentId,
                contentId: req.body.wordId
            })
            .then(function (score) {
                if (score) {
                    var newScore = new StudentLessonScore({
                        score: req.body.score
                    });
                    newScore.update(score._id)
                        .then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        });
                } else {
                    var newScore = new StudentLessonScore({
                        lessonId: req.body.lessonId,
                        studentId: req.body.studentId,
                        contentId: req.body.wordId,
                        score: req.body.score,
                        createdBy: req.session.admin._id
                    });

                    newScore.save().then(function (result) {
                        if (result) {
                            res.jsonp(result);
                        }
                    });
                }
            });
    });
}