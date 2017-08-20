var LessonContent = require('../../models/lessonContent.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/lessonContent/save', checkLogin);
    app.post('/admin/lessonContent/save', function (req, res) {
        LessonContent.getFilter({
                lessonId: req.body.lessonId
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
                lessonId: req.body.lessonId
            })
            .then(function (content) {
                res.jsonp({
                    content: content
                });
            });
    });
}