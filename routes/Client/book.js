var Lesson = require('../../models/lesson.js'),
    Book = require('../../models/book.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    LessonContent = require('../../models/lessonContent.js'),
    StudentLesson = require('../../models/studentLesson.js'),
    StudentLessonScore = require('../../models/studentLessonScore.js'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
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
            studentId: req.query.studentId,
            minLesson: req.query.minLesson,
            maxLesson: req.query.maxLesson
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
        if (req.body.minLesson) {
            filter.sequence = {
                $lte: req.body.maxLesson,
                $gte: req.body.minLesson
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
                    studentId: req.query.studentId,
                    bookId: lesson.bookId,
                    minLesson: req.query.minLesson,
                    maxLesson: req.query.maxLesson
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

    // 保存成绩
    function saveScore(req) {
        return StudentLessonScore.getFilter({
                lessonId: req.body.lessonId,
                studentId: req.body.studentId,
                contentId: req.body.wordId
            })
            .then(function (score) {
                //save score
                if (score) {
                    //save record
                    saveRecord(req.body.studentId, req.body.recordId, score._id);

                    var newScore = new StudentLessonScore({
                        score: req.body.score,
                        contentRecord: req.body.recordId
                    });
                    return newScore.update(score._id);
                } else {
                    var newScore = new StudentLessonScore({
                        lessonId: req.body.lessonId,
                        studentId: req.body.studentId,
                        contentId: req.body.wordId,
                        contentType: req.body.contentType,
                        score: req.body.score,
                        contentRecord: req.body.recordId,
                        createdBy: req.session.user._id
                    });

                    return newScore.save().then(function (result) {
                        if (result) {
                            //save record
                            saveRecord(req.body.studentId, req.body.recordId, result._id);
                        }
                        return result;
                    });
                }
            });
    };

    function getContentOption(req, scoreResult, isExist) {
        return getAvg(req)
            .then(function (avg) {
                switch (req.body.contentType) {
                    case "0":
                        return {
                            paragraphAve: req.body.score
                        };
                    case "1":
                        var option = {
                            wordAve: avg
                        }
                        if (scoreResult._id) {
                            //new;
                            if (isExist) {
                                option.$inc = {
                                    wordProcess: 1
                                };
                            } else {
                                option.wordProcess = 1;
                            }
                        }
                        return option;
                    case "2":
                        var option = {
                            sentAve: avg
                        }
                        if (scoreResult._id) {
                            //new;
                            if (isExist) {
                                option.$inc = {
                                    sentProcess: 1
                                };
                            } else {
                                option.sentProcess = 1;
                            }
                        }
                        return option;
                }
            });

    };

    function getAvg(req) {
        if (req.body.contentType == "0") {
            return Promise.resolve();
        }
        return StudentLessonScore.getAverage(req.body.lessonId, req.body.studentId, req.body.contentType)
            .then(function (result) {
                return (result && result[0] && result[0].score) || req.body.score;
            });
    };

    app.post('/book/lesson/score', checkLogin);
    app.post('/book/lesson/score', function (req, res) {
        StudentLesson.getFilter({
                lessonId: req.body.lessonId,
                studentId: req.body.studentId
            })
            .then(function (studentLesson) {
                saveScore(req)
                    .then(function (scoreResult) {
                        //contentType
                        return getContentOption(req, scoreResult, studentLesson)
                            .then(function (option) {
                                if (studentLesson) {
                                    //关系已经存在
                                    var newRelation = new StudentLesson(option);
                                    return newRelation.update(studentLesson._id);
                                } else {
                                    //关系未存在
                                    option.studentId = req.body.studentId;
                                    option.lessonId = req.body.lessonId;
                                    var newRelation = new StudentLesson(option);
                                    return newRelation.save();
                                }
                            });
                    })
                    .then(function () {
                        res.jsonp({
                            sucess: true
                        });
                    });
            });
    });

    function saveRecord(studentId, recordId, scoreId) {
        var folder = path.join(process.cwd(), '/public/uploads/scores/' + studentId + '/');
        fs.stat(folder, function (err, stats) {
            if (err) {
                fs.mkdir(folder, function (err) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    request('https://records.17kouyu.com/' + recordId + '.mp3')
                        .pipe(fs.createWriteStream(path.join(folder, scoreId + '.mp3')));
                });
            } else {
                //存在
                request('https://records.17kouyu.com/' + recordId + '.mp3')
                    .pipe(fs.createWriteStream(path.join(folder, scoreId + '.mp3')));
            }
        });
    };
}