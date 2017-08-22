var LessonContent = require('../../models/lessonContent.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/lessonContent/save', checkLogin);
    app.post('/admin/lessonContent/save', function (req, res) {
        LessonContent.getFilter({
                lessonId: req.body.lessonId,
                contentType: 0
            })
            .then(function (content) {
                if (content) {
                    var lessonContent = new LessonContent({
                        name: req.body.content
                    });
                    lessonContent.update(content._id)
                        .then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        });
                } else {
                    var lessonContent = new LessonContent({
                        contentType: 0,
                        name: req.body.content,
                        lessonId: req.body.lessonId,
                        createdBy: req.session.admin._id
                    });

                    lessonContent.save().then(function (result) {
                        if (result) {
                            res.jsonp(lessonContent);
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

    app.post('/admin/lessonWord/add', checkLogin);
    app.post('/admin/lessonWord/add', function (req, res) {
        var lessonWord = new LessonContent({
            name: req.body.name,
            lessonId: req.body.lessonId,
            createdBy: req.session.admin._id,
            contentType: 1,
        });

        lessonWord.save().then(function (result) {
            if (result) {
                res.jsonp(lessonWord);
            }
        });
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

    app.post('/admin/lessonSentence/add', checkLogin);
    app.post('/admin/lessonSentence/add', function (req, res) {
        var lessonSentence = new LessonContent({
            name: req.body.name,
            lessonId: req.body.lessonId,
            createdBy: req.session.admin._id,
            contentType: 2
        });

        lessonSentence.save().then(function (result) {
            if (result) {
                res.jsonp(lessonSentence);
            }
        });
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