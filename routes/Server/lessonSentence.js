var LessonSentence = require('../../models/lessonSentence.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/lessonSentence/add', checkLogin);
    app.post('/admin/lessonSentence/add', function (req, res) {
        var lessonSentence = new LessonSentence({
            name: req.body.name,
            lessonId: req.body.lessonId,
            createdBy: req.session.admin._id
        });

        lessonSentence.save().then(function (result) {
            if (result) {
                res.jsonp(lessonSentence);
            }
        });
    });

    app.post('/admin/lessonSentence/edit', checkLogin);
    app.post('/admin/lessonSentence/edit', function (req, res) {
        var lessonSentence = new LessonSentence({
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
        LessonSentence.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/lessonList/search/sentence', checkLogin);
    app.post('/admin/lessonList/search/sentence', function (req, res) {
        LessonSentence.getFilters({
                lessonId: req.body.lessonId
            })
            .then(function (sentences) {
                res.jsonp({
                    sentences: sentences
                });
            });
    });
}