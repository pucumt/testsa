var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    LessonContent = model.lessonContent,
    auth = require("./auth"),
    checkLogin = auth.checkLogin; // TBD

module.exports = function (app) {
    app.post('/admin/lessonContent/save', checkLogin);
    app.post('/admin/lessonContent/save', function (req, res) {
        LessonContent.getFilter({
                lessonId: req.body.lessonId,
                contentType: 0
            })
            .then(function (content) {
                if (content) {
                    LessonContent.update({
                            name: req.body.content,
                            duration: req.body.duration
                        }, {
                            where: {
                                _id: content._id
                            }
                        })
                        .then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        });
                } else {
                    LessonContent.create({
                            contentType: 0,
                            name: req.body.content,
                            lessonId: req.body.lessonId,
                            duration: req.body.duration,
                            createdBy: req.session.admin._id
                        })
                        .then(function (result) {
                            if (result) {
                                res.jsonp(result);
                            }
                        });
                }
            });
    });

    app.post('/admin/lessonList/search/content', checkLogin);
    app.post('/admin/lessonList/search/content', function (req, res) {
        LessonContent.getFilter({
                lessonId: req.body.lessonId,
                contentType: 0
            })
            .then(function (content) {
                res.jsonp({
                    content: content
                });
            });
    });

    function getNewWord(req, name) {
        return {
            name: name,
            lessonId: req.body.lessonId,
            createdBy: req.session.admin._id,
            contentType: 1
        };
    };

    app.post('/admin/lessonWord/add', checkLogin);
    app.post('/admin/lessonWord/add', function (req, res) {
        var names = req.body.name.split("\n");
        if (names.length > 0) {
            var pArray = [];
            names.forEach(function (name) {
                if (name != "") {
                    pArray.push(getNewWord(req, name));
                }
            });

            LessonContent.bulkCreate(pArray)
                .then(function () {
                    res.jsonp({
                        sucess: true
                    });
                });
        } else {
            //不做处理
            res.jsonp({
                sucess: true
            });
        }
    });

    app.post('/admin/lessonWord/edit', checkLogin);
    app.post('/admin/lessonWord/edit', function (req, res) {
        var lessonWord = new LessonContent({
            name: req.body.name,
            lessonId: req.body.lessonId
        });

        lessonWord.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lessonWord/delete', checkLogin);
    app.post('/admin/lessonWord/delete', function (req, res) {
        LessonContent.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/lessonList/search/word', checkLogin);
    app.post('/admin/lessonList/search/word', function (req, res) {
        LessonContent.getFilters({
                lessonId: req.body.lessonId,
                contentType: 1
            })
            .then(function (words) {
                res.jsonp({
                    words: words
                });
            });
    });

    function getNewSentence(req, name) {
        return {
            name: name,
            lessonId: req.body.lessonId,
            createdBy: req.session.admin._id,
            contentType: 2
        };
    };

    app.post('/admin/lessonSentence/add', checkLogin);
    app.post('/admin/lessonSentence/add', function (req, res) {
        var names = req.body.name.split("\n");
        if (names.length > 0) {
            var pArray = [];
            names.forEach(function (name) {
                if (name != "") {
                    pArray.push(getNewSentence(req, name));
                }
            });

            LessonContent.insertMany(pArray)
                .then(function () {
                    res.jsonp({
                        sucess: true
                    });
                });
        } else {
            //不做处理
            res.jsonp({
                sucess: true
            });
        }
    });

    app.post('/admin/lessonSentence/edit', checkLogin);
    app.post('/admin/lessonSentence/edit', function (req, res) {
        var lessonSentence = new LessonContent({
            name: req.body.name,
            lessonId: req.body.lessonId
        });

        lessonSentence.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lessonSentence/delete', checkLogin);
    app.post('/admin/lessonSentence/delete', function (req, res) {
        LessonContent.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/lessonList/search/sentence', checkLogin);
    app.post('/admin/lessonList/search/sentence', function (req, res) {
        LessonContent.getFilters({
                lessonId: req.body.lessonId,
                contentType: 2
            })
            .then(function (sentences) {
                res.jsonp({
                    sentences: sentences
                });
            });
    });
}