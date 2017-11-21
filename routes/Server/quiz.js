var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Quiz = model.quiz,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/quizList', checkLogin);
    //app.get('/admin/quizList', auth.checkSecure([0]));
    app.get('/admin/quizList', function (req, res) {
        res.render('Server/quizList.html', {
            title: '>小测试名称列表',
            user: req.session.admin
        });
    });

    app.post('/admin/quiz/add', checkLogin);
    app.post('/admin/quiz/add', function (req, res) {
        Quiz.getFilter({
                name: req.body.name
            })
            .then(function (quiz) {
                if (quiz) {
                    res.jsonp({
                        error: "同名考试已经存在！"
                    });
                } else {
                    Quiz.create({
                            name: req.body.name,
                            sequence: req.body.sequence,
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

    app.post('/admin/quiz/edit', checkLogin);
    app.post('/admin/quiz/edit', function (req, res) {
        Quiz.getFilter({
                name: req.body.name,
                _id: {
                    $ne: req.body.id
                }
            })
            .then(function (quiz) {
                if (quiz) {
                    res.jsonp({
                        error: "同名课本已经存在！"
                    });
                } else {
                    Quiz.update({
                            name: req.body.name,
                            sequence: req.body.sequence
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
                }
            });
    });

    app.post('/admin/quiz/delete', checkLogin);
    app.post('/admin/quiz/delete', function (req, res) {
        Quiz.update({
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

    app.post('/admin/quizList/search', checkLogin);
    app.post('/admin/quizList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        Quiz.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    quizzes: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
    });
}