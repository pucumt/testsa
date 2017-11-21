var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    StudentAccount = model.studentAccount,
    StudentInfo = model.studentInfo,
    auth = require("./auth"),
    crypto = require('crypto'),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/studentAccountList', checkLogin);
    app.get('/admin/studentAccountList', auth.checkSecure([0, 3, 7, 8]));
    app.get('/admin/studentAccountList', function (req, res) {
        res.render('Server/studentAccountList.html', {
            title: '>学生管理',
            user: req.session.admin
        });
    });

    app.post('/admin/studentAccountList/search', checkLogin);
    app.post('/admin/studentAccountList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;

        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        //查询并返回第 page 页的 20 篇文章
        StudentAccount.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    studentAccounts: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
    });

    app.post('/admin/studentAccount/reset', checkLogin);
    app.post('/admin/studentAccount/reset', function (req, res) {
        var md5 = crypto.createHash('md5');
        StudentAccount.update({
                password: password = md5.update("111111").digest('hex')
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

    app.post('/admin/studentAccount/edit', checkLogin);
    app.post('/admin/studentAccount/edit', function (req, res) {
        var filter = {
            _id: {
                $ne: req.body.id
            },
            name: req.body.name
        };
        StudentAccount.getFilter(filter)
            .then(function (account) {
                if (account) {
                    res.jsonp({
                        error: "账号已经存在"
                    });
                    return;
                } else {
                    StudentAccount.update({
                            name: req.body.name
                        }, {
                            where: {
                                _id: req.body.id
                            }
                        })
                        .then(function (studentAccount) {
                            res.jsonp(studentAccount);
                        });
                }
            });
    });

    app.post('/admin/studentAccount/delete', checkLogin);
    app.post('/admin/studentAccount/delete', function (req, res) {
        //delete students first
        var filter = {
            accountId: req.body.id
        };
        model.db.sequelize.transaction(function (t1) {
            return StudentInfo.update({
                    isDeleted: true,
                    deletedBy: req.session.admin._id,
                    deletedDate: new Date()
                }, {
                    where: filter,
                    transaction: t1
                })
                .then(function (result) {
                    return StudentAccount.update({
                        isDeleted: true,
                        deletedBy: req.session.admin._id,
                        deletedDate: new Date()
                    }, {
                        where: {
                            _id: req.body.id
                        },
                        transaction: t1
                    });
                });
        }).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/studentAccount/newStudent', checkLogin);
    app.post('/admin/studentAccount/newStudent', function (req, res) {
        var accountId = "";
        StudentAccount.getFilter({
                name: req.body.mobile
            })
            .then(function (account) {
                if (!account) {
                    var md5 = crypto.createHash('md5');
                    return StudentAccount.create({
                        name: req.body.mobile,
                        password: md5.update("111111").digest('hex'),
                        createdBy: req.session.admin._id
                    });
                }
                return account;
            })
            .then(function (account) {
                accountId = account._id;
                return StudentInfo.getFilter({
                    name: req.body.name,
                    accountId: account._id
                });
            })
            .then(function (student) {
                if (student) {
                    res.jsonp({
                        error: "学生已经存在"
                    });
                    return;
                }

                return StudentInfo.create({
                    name: req.body.name,
                    sex: req.body.sex,
                    accountId: accountId,
                    mobile: req.body.mobile,
                    gradeId: req.body.gradeId,
                    gradeName: req.body.gradeName,
                    School: req.body.School,
                    className: req.body.className,
                    createdBy: req.session.admin._id
                });
            })
            .then(function (student) {
                if (student) {
                    res.jsonp({
                        sucess: true
                    });
                }
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.get('/admin/studentAccount/:id', checkLogin);
    app.get('/admin/studentAccount/:id', function (req, res) {
        StudentAccount.getFilter({
                _id: req.params.id
            })
            .then(function (account) {
                if (account) {
                    res.jsonp(account);
                }
            });
    });

    app.post('/admin/studentAccount/updateMobile', checkLogin);
    app.post('/admin/studentAccount/updateMobile', function (req, res) {
        StudentInfo.getFilters({})
            .then(function (students) {
                students.forEach(function (student) {
                    StudentAccount.getFilter({
                            _id: student.accountId
                        })
                        .then(function (account) {
                            return StudentInfo.update({
                                mobile: account.name
                            }, {
                                where: {
                                    _id: student._id
                                }
                            });
                        });
                });
                res.jsonp({
                    sucess: true
                });
                return;
            });
    });
}