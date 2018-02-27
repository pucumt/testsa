var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Lesson = model.lesson,
    Book = model.book,
    StudentInfo = model.studentInfo,
    LessonContent = model.lessonContent,
    StudentLesson = model.studentLesson,
    StudentLessonScore = model.studentLessonScore,
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
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.minLesson) {
            filter.sequence = {
                $lte: req.body.maxLesson,
                $gte: req.body.minLesson
            };
        }
        Lesson.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                lessons: result.rows,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    // 成绩列表页 
    app.get('/book/lesson/category', checkLogin);
    app.get('/book/lesson/category', function (req, res) {
        Lesson.getFilter({
                _id: req.query.id
            })
            .then(function (lesson) {
                res.render('Client/book_lesson_category.html', {
                    title: '成绩单',
                    user: req.session.user,
                    lessonId: req.query.id,
                    studentId: req.query.studentId,
                    bookId: lesson.bookId,
                    minLesson: req.query.minLesson,
                    maxLesson: req.query.maxLesson
                });
            });
    });

    // 详细得分页
    app.get('/book/lesson/:id', checkLogin);
    app.get('/book/lesson/:id', function (req, res) {
        Lesson.getFilter({
                _id: req.params.id
            })
            .then(function (lesson) {
                res.render('Client/book_lesson_detail.html', {
                    title: '课文列表',
                    user: req.session.user,
                    name: lesson.name,
                    lessonId: req.params.id,
                    studentId: req.query.studentId,
                    bookId: lesson.bookId,
                    minLesson: req.query.minLesson,
                    maxLesson: req.query.maxLesson,
                    curType: req.query.curType
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

                    var option = {
                        score: req.body.score,
                        contentRecord: req.body.recordId
                    };
                    if (req.body.contentType == "0") {
                        option.scoreResult = req.body.scoreResult;
                    }
                    return StudentLessonScore.update(option, {
                            where: {
                                _id: score._id
                            }
                        })
                        .then(function () {
                            return score._id;
                        });
                } else {
                    var option = {
                        lessonId: req.body.lessonId,
                        studentId: req.body.studentId,
                        contentId: req.body.wordId,
                        contentType: req.body.contentType,
                        score: req.body.score,
                        contentRecord: req.body.recordId
                    };
                    if (req.body.contentType == "0") {
                        option.scoreResult = req.body.scoreResult;
                    } else {
                        option.scoreResult = "";
                    }
                    return StudentLessonScore.create(option)
                        .then(function (result) {
                            if (result) {
                                //save record
                                saveRecord(req.body.studentId, req.body.recordId, result._id);
                            }
                            return result;
                        })
                        .catch(ex => {
                            console.log(ex);
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
                                option.wordProcess = model.db.sequelize.literal('`wordProcess`+1');
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
                                option.sentProcess = model.db.sequelize.literal('`sentProcess`+1');
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
        return model.db.sequelize.query("select avg(score) as score from studentLessonScores \
                where isDeleted=false and lessonId=:lessonId and studentId=:studentId and contentType=:contentType", {
                replacements: {
                    lessonId: req.body.lessonId,
                    studentId: req.body.studentId,
                    contentType: req.body.contentType
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (result) {
                return (result && result[0] && result[0].score) || req.body.score;
            });
    };

    // app.post('/book/lesson/score', checkLogin);
    app.post('/app/score', function (req, res) {
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
                                    return StudentLesson.update(option, {
                                            where: {
                                                _id: studentLesson._id
                                            }
                                        })
                                        .then(function () {
                                            return scoreResult;
                                        });
                                } else {
                                    //关系未存在
                                    option.studentId = req.body.studentId;
                                    option.lessonId = req.body.lessonId;
                                    return StudentLesson.create(option)
                                        .then(function () {
                                            return scoreResult;
                                        });
                                }
                            });
                    })
                    .then(function (scoreResult) {
                        res.jsonp({
                            sucess: true,
                            scoreId: (scoreResult._id || scoreResult)
                        });
                    });
            });
    });

    function saveRecord(studentId, recordId, scoreId) {
        //return;
        var folder = path.join(process.cwd(), '/public/uploads/scores/' + studentId + '/');
        fs.stat(folder, function (err, stats) {
            if (err) {
                fs.mkdir(folder, function (err) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    request('http://' + recordId + ".mp3")
                        .pipe(fs.createWriteStream(path.join(folder, scoreId + '.mp3')));
                });
            } else {
                //存在
                request('http://' + recordId + ".mp3")
                    .pipe(fs.createWriteStream(path.join(folder, scoreId + '.mp3')));
            }
        });
    };


    app.post('/app/lessonList', function (req, res) {
        if (!req.body.studentId) {
            res.jsonp({
                error: "信息不正确"
            });
            return;
        }

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
            .then(function (result) {
                res.jsonp(result);
            });
    });

    app.post('/app/contents', function (req, res) {
        if (!req.body.studentId) {
            res.jsonp({
                error: "信息不正确"
            });
            return;
        }

        var sql = "select C._id, S.score, S._id as scoreId, C.contentType, C.name, C.duration, S.scoreResult \
        from lessonContents C left join studentLessonScores S  \
        on S.contentId=C._id and S.studentId=:studentId and S.isDeleted=false \
        where  C.isDeleted=false and C.lessonId=:lessonId and ";
        switch (req.body.contentType) {
            case "0":
                sql += " C.contentType in (0, 2) ";
                break;
            default:
                sql += " C.contentType=:contentType ";
                break;
        }
        sql += " order by C.contentType, C.sequence, C.createdDate, C._id";

        model.db.sequelize.query(sql, {
                replacements: {
                    studentId: req.body.studentId,
                    lessonId: req.body.lessonId,
                    contentType: req.body.contentType
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(contents => {
                res.jsonp(contents);
            });
    });

    app.post('/app/contentTypes', function (req, res) {
        if (!req.body.studentId) {
            res.jsonp({
                error: "信息不正确"
            });
            return;
        }
        model.db.sequelize.query("select distinct contentType \
        from lessonContents  \
        where lessonId=:lessonId and isDeleted=false order by contentType", {
                replacements: {
                    lessonId: req.body.lessonId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(contents => {
                res.jsonp(contents);
            });
    });

    app.post('/app/contentTypes2', function (req, res) {
        if (!req.body.studentId) {
            res.jsonp({
                error: "信息不正确"
            });
            return;
        }

        model.db.sequelize.query("select contentType, count(0) as count from lessonContents where lessonId=:lessonId and isDeleted=false group by contentType", {
                replacements: {
                    lessonId: req.body.lessonId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (countResult) {
                //总数 countResult
                var lessonCount = {};
                if (countResult && countResult.length > 0) {
                    countResult.forEach(function (result) {
                        switch (result.contentType) {
                            case 1:
                                lessonCount.wordCount = result.count;
                                break;
                            case 2:
                                lessonCount.sentCount = result.count;
                                break;
                            default:
                                lessonCount.isPara = true;
                                break;
                        }
                    });
                } else {
                    res.jsonp({
                        error: "还没有课文呢"
                    });
                    return;
                }


                StudentLesson.getFilter({
                        lessonId: req.body.lessonId,
                        studentId: req.body.studentId
                    })
                    .then(function (stuLesson) {
                        if (stuLesson) {
                            res.jsonp({
                                stuLesson: stuLesson.toJSON(),
                                wordCount: lessonCount.wordCount,
                                sentCount: lessonCount.sentCount,
                                isPara: lessonCount.isPara
                            });
                        } else {
                            res.jsonp({
                                wordCount: lessonCount.wordCount,
                                sentCount: lessonCount.sentCount,
                                isPara: lessonCount.isPara
                            });
                        }
                    });
            });
    });
}