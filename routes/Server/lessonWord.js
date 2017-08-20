var LessonWord = require('../../models/lessonWord.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/lessonWord/add', checkLogin);
    app.post('/admin/lessonWord/add', function (req, res) {
        var lessonWord = new LessonWord({
            name: req.body.name,
            lessonId: req.body.lessonId,
            createdBy: req.session.admin._id
        });

        lessonWord.save().then(function (result) {
            if (result) {
                res.jsonp(lessonWord);
            }
        });
    });

    app.post('/admin/lessonWord/edit', checkLogin);
    app.post('/admin/lessonWord/edit', function (req, res) {
        var lessonWord = new LessonWord({
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
        LessonWord.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/lessonList/search/word', checkLogin);
    app.post('/admin/lessonList/search/word', function (req, res) {
        LessonWord.getFilters({
                lessonId: req.body.lessonId
            })
            .then(function (words) {
                res.jsonp({
                    words: words
                });
            });
    });
}