var Grade = require('../../models/grade.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/gradeList', checkLogin);
    app.get('/admin/gradeList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Grade.getAll(null, page, {}, function(err, grades, total) {
            if (err) {
                grades = [];
            }
            res.render('Server/gradeList.html', {
                title: '>年级设置',
                user: req.session.user,
                grades: grades
            });
        });
    });

    app.post('/admin/grade/add', checkLogin);
    app.post('/admin/grade/add', function(req, res) {
        var grade = new Grade({
            name: req.body.name,
            address: req.body.address
        });

        grade.save(function(err, grade) {
            if (err) {
                grade = {};
            }
            res.jsonp(grade);
        });
    });

    app.post('/admin/grade/edit', checkLogin);
    app.post('/admin/grade/edit', function(req, res) {
        var grade = new Grade({
            name: req.body.name,
            address: req.body.address
        });

        grade.update(req.body.id, function(err, grade) {
            if (err) {
                grade = {};
            }
            res.jsonp(grade);
        });
    });

    app.post('/admin/grade/delete', checkLogin);
    app.post('/admin/grade/delete', function(req, res) {
        Grade.delete(req.body.id, function(err, grade) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.get('/admin/grade/getAll', checkLogin);
    app.get('/admin/grade/getAll', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Grade.getAll(null, page, {}, function(err, grades, total) {
            if (err) {
                grades = [];
            }
            res.jsonp(grades);
        });
    });

}