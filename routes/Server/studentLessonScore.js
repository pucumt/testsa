var StudentLessonScore = require('../../models/studentLessonScore.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/studentLessonScoreList', checkLogin);
    app.get('/admin/studentLessonScoreList', function(req, res) {
        res.render('Server/studentLessonScoreList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/studentLessonScore/add', checkLogin);
    app.post('/admin/studentLessonScore/add', function(req, res) {
        var studentLessonScore = new StudentLessonScore({
            name: req.body.name,
            address: req.body.address,
            createdBy: req.session.admin._id
        });

        studentLessonScore.save().then(function(result){
            if(result)
            {
                 res.jsonp(studentLessonScore);
            }
        });
    });

    app.post('/admin/studentLessonScore/edit', checkLogin);
    app.post('/admin/studentLessonScore/edit', function(req, res) {
        var studentLessonScore = new StudentLessonScore({
            name: req.body.name,
            address: req.body.address
        });

        studentLessonScore.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/studentLessonScore/delete', checkLogin);
    app.post('/admin/studentLessonScore/delete', function(req, res) {
        StudentLessonScore.delete(req.body.id, req.session.admin._id).then(function(result){
           res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/studentLessonScoreList/search', checkLogin);
    app.post('/admin/studentLessonScoreList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name) {
            var reg = new RegExp(req.body.name, 'i')
            filter.name = {
                $regex: reg
            };
        }

        StudentLessonScore.getAll(null, page, filter, function(err, studentLessonScores, total) {
            if (err) {
                studentLessonScores = [];
            }
            res.jsonp({
                studentLessonScores: studentLessonScores,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + studentLessonScores.length) == total
            });
        });
    });
}