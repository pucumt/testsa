var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    LessonContent = model.lessonContent,
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
                    LessonContent.update({
                            name: req.body.content
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

    app.post('/admin/lessonContent/add', checkLogin);
    app.post('/admin/lessonContent/add', function (req, res) {
        LessonContent.create({
                name: req.body.name,
                lessonId: req.body.lessonId,
                startSent: req.body.startSent,
                createdBy: req.session.admin._id,
                contentType: 0
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lessonContent/edit', checkLogin);
    app.post('/admin/lessonContent/edit', function (req, res) {
        LessonContent.update({
                name: req.body.name,
                startSent: req.body.startSent,
                updatedDate: new Date(),
                deletedBy: req.session.admin._id
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lessonContent/delete', checkLogin);
    app.post('/admin/lessonContent/delete', function (req, res) {
        LessonContent.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lessonList/search/content', checkLogin);
    app.post('/admin/lessonList/search/content', function (req, res) {
        LessonContent.getFilters({
                lessonId: req.body.lessonId,
                contentType: 0
            })
            .then(function (contents) {
                res.jsonp({
                    contents: contents
                });
            });
    });

    function getNewWord(req, name) {
        return {
            _id: model.db.generateId(),
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
        LessonContent.update({
                name: req.body.name,
                lessonId: req.body.lessonId
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lessonWord/delete', checkLogin);
    app.post('/admin/lessonWord/delete', function (req, res) {
        LessonContent.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
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
            _id: model.db.generateId(),
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

    app.post('/admin/lessonSentence/edit', checkLogin);
    app.post('/admin/lessonSentence/edit', function (req, res) {
        LessonContent.update({
                name: req.body.name,
                lessonId: req.body.lessonId
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/lessonSentence/delete', checkLogin);
    app.post('/admin/lessonSentence/delete', function (req, res) {
        LessonContent.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
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