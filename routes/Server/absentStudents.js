var AbsentStudents = require('../../models/absentStudents.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/adminRollCallList', checkLogin);
    app.get('/admin/adminRollCallList', function(req, res) {
        res.render('Server/adminRollCallList.html', {
            title: '>缺席学生列表',
            user: req.session.admin
        });
    });

    app.post('/admin/absentStudentsList/search', checkLogin);
    app.post('/admin/absentStudentsList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            // absentDate: (new Date()).toLocaleDateString()
        };
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        if (req.body.isChecked) {
            filter.isCheck = (req.body.isChecked == "1");
        }

        AbsentStudents.getAll(null, page, filter, function(err, absentStudents, total) {
            if (err) {
                absentStudents = [];
            }
            res.jsonp({
                absentStudents: absentStudents,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + absentStudents.length) == total
            });
        });
    });

    app.post('/admin/absentStudents/comment', checkLogin);
    app.post('/admin/absentStudents/comment', function(req, res) {
        var option = {
            comment: req.body.comment
        };
        if (req.body.isCheck == "1") {
            option.isCheck = true;
        }
        var abStudent = new AbsentStudents(option);

        abStudent.update(req.body.id)
            .then(function(result) {
                res.jsonp({ sucess: true });
            });
    });
}