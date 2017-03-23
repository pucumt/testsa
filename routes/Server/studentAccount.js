var StudentAccount = require('../../models/studentAccount.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/studentAccountList', checkLogin);
    app.get('/admin/studentAccountList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        StudentAccount.getAll(null, page, {}, function(err, studentAccounts, total) {
            if (err) {
                studentAccounts = [];
            }
            res.render('Server/studentAccountList.html', {
                title: '>校区列表',
                user: req.session.user,
                studentAccounts: studentAccounts,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + studentAccounts.length) == total
            });
        });
    });

    app.post('/admin/studentAccount/add', checkLogin);
    app.post('/admin/studentAccount/add', function(req, res) {
        var studentAccount = new StudentAccount({
            name: req.body.name,
            password: req.body.password || "111111"
        });

        studentAccount.save(function(err, studentAccount) {
            if (err) {
                studentAccount = {};
            }
            res.jsonp(studentAccount);
        });
    });

    app.post('/admin/studentAccount/edit', checkLogin);
    app.post('/admin/studentAccount/edit', function(req, res) {
        var studentAccount = new StudentAccount({
            name: req.body.name
        });

        studentAccount.update(req.body.id, function(err, studentAccount) {
            if (err) {
                studentAccount = {};
            }
            res.jsonp(studentAccount);
        });
    });

    app.post('/admin/studentAccount/delete', checkLogin);
    app.post('/admin/studentAccount/delete', function(req, res) {
        StudentAccount.delete(req.body.id, function(err, studentAccount) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/studentAccount/newStudent', checkLogin);
    app.post('/admin/studentAccount/newStudent', function(req, res) {
        var accountId = "";
        StudentAccount.getFilter({ name: req.body.mobile })
            .then(function(account) {
                if (!account) {
                    var studentAccount = new StudentAccount({
                        name: req.body.mobile,
                        password: "111111"
                    });
                    return studentAccount.save();
                }
                return account;
            })
            .then(function(account) {
                accountId = account._id;
                return StudentInfo.getFilter({ name: req.body.name, accountId: account._id });
            })
            .then(function(student) {
                if (student) {
                    res.jsonp({ error: "学生已经存在" });
                    return;
                }

                var studentInfo = new StudentInfo({
                    name: req.body.name,
                    sex: req.body.sex,
                    accountId: accountId,
                    mobile: req.body.mobile
                });

                return studentInfo.save();
            })
            .then(function(student) {
                if (student) {
                    res.jsonp({ sucess: true });
                    return;
                }
            })
            .catch(function(err) {
                res.jsonp({ error: err });
                return;
            });
    });
}