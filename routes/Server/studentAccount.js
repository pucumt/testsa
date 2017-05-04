var StudentAccount = require('../../models/studentAccount.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    auth = require("./auth"),
    crypto = require('crypto'),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/studentAccountList', checkLogin);
    app.get('/admin/studentAccountList', function(req, res) {
        res.render('Server/studentAccountList.html', {
            title: '>学生管理',
            user: req.session.admin
        });
    });

    app.post('/admin/studentAccountList/search', checkLogin);
    app.post('/admin/studentAccountList/search', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;

        var filter = {};
        if (req.body.name) {
            var reg = new RegExp(req.body.name, 'i')
            filter.name = {
                $regex: reg
            };
        }
        //查询并返回第 page 页的 20 篇文章
        StudentAccount.getAll(null, page, filter, function(err, studentAccounts, total) {
            if (err) {
                studentAccounts = [];
            }
            res.jsonp({
                studentAccounts: studentAccounts,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + studentAccounts.length) == total
            });
        });
    });

    app.post('/admin/studentAccount/reset', checkLogin);
    app.post('/admin/studentAccount/reset', function(req, res) {
        var md5 = crypto.createHash('md5');
        var studentAccount = new StudentAccount({
            password: password = md5.update("111111").digest('hex')
        });
        studentAccount.update(req.body.id, function(err, studentAccount) {
            if (err) {
                studentAccount = {};
            }
            res.jsonp({ sucess: true });
            return;
        });
    });

    app.post('/admin/studentAccount/edit', checkLogin);
    app.post('/admin/studentAccount/edit', function(req, res) {
        var filter = {
            _id: { $ne: req.body.id },
            name: req.body.name
        };
        StudentAccount.getFilter(filter)
            .then(function(account) {
                if (account) {
                    res.jsonp({ error: "账号已经存在" });
                    return;
                } else {
                    var studentAccount = new StudentAccount({ name: req.body.name });
                    studentAccount.update(req.body.id, function(err, studentAccount) {
                        if (err) {
                            studentAccount = {};
                        }
                        res.jsonp(studentAccount);
                        return;
                    });
                }
            });
    });

    app.post('/admin/studentAccount/delete', checkLogin);
    app.post('/admin/studentAccount/delete', function(req, res) {
        //delete students first
        var filter = { accountId: req.body.id };
        StudentInfo.deleteFilter(filter, function(err, studentInfo) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            StudentAccount.delete(req.body.id, function(err, studentAccount) {
                if (err) {
                    res.jsonp({ error: err });
                    return;
                }
                res.jsonp({ sucess: true });
            });
        })
    });

    app.post('/admin/studentAccount/newStudent', checkLogin);
    app.post('/admin/studentAccount/newStudent', function(req, res) {
        var accountId = "";
        StudentAccount.getFilter({ name: req.body.mobile })
            .then(function(account) {
                if (!account) {
                    var md5 = crypto.createHash('md5');
                    var studentAccount = new StudentAccount({
                        name: req.body.mobile,
                        password: md5.update("111111").digest('hex')
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
                    mobile: req.body.mobile,
                    gradeId: req.body.gradeId,
                    gradeName: req.body.gradeName,
                    School: req.body.School,
                    className: req.body.className
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

    app.get('/admin/studentAccount/:id', checkLogin);
    app.get('/admin/studentAccount/:id', function(req, res) {
        StudentAccount.get(req.params.id).then(function(account) {
            if (account) {
                res.jsonp(account);
            }
        });
    });

    app.post('/admin/studentAccount/updateMobile', checkLogin);
    app.post('/admin/studentAccount/updateMobile', function(req, res) {
        StudentInfo.getFilters({})
            .then(function(students) {
                students.forEach(function(student) {
                    StudentAccount.get(student.accountId)
                        .then(function(account) {
                            var updateStudent = new StudentInfo({
                                mobile: account.name
                            });
                            updateStudent.update(student._id, function() {});
                        });
                });
                res.jsonp({ sucess: true });
                return;
            });
    });
}