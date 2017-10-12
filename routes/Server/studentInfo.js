var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    StudentInfo = model.studentInfo,
    StudentAccount = model.studentAccount,
    AdminEnrollTrain = model.adminEnrollTrain,
    crypto = require('crypto'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/studentsList', checkLogin);
    app.get('/admin/studentsList', function (req, res) {
        res.render('Server/studentInfoList.html', {
            title: '>学生管理',
            user: req.session.admin
        });
    });

    app.get('/admin/studentDetail/:id', checkLogin);
    app.get('/admin/studentDetail/:id', function (req, res) {
        res.render('Server/studentDetail.html', {
            title: '>学生管理',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.get('/admin/studentScore/:id/:fromPage', checkLogin);
    app.get('/admin/studentScore/:id/:fromPage', function (req, res) {
        res.render('Server/studentScore.html', {
            title: '>学生成绩',
            user: req.session.admin,
            id: req.params.id,
            fromPage: req.params.fromPage
        });
    });

    app.post('/admin/studentInfo/edit', checkLogin);
    app.post('/admin/studentInfo/edit', function (req, res) {
        StudentAccount.getFilter({
                name: req.body.mobile
            })
            .then(function (account) {
                var p;
                if (account) {
                    var accountId = account._id == req.body.accountId ? req.body.accountId : account._id;
                    p = Promise.resolve(accountId);
                } else {
                    var md5 = crypto.createHash('md5');
                    p = StudentAccount.create({
                            name: req.body.mobile,
                            password: md5.update("111111").digest('hex')
                        })
                        .then(function (account) {
                            return account._id;
                        });
                }
                p.then(function (accountId) {
                    StudentInfo.getFilter({
                            accountId: accountId,
                            name: req.body.name,
                            _id: {
                                $ne: req.body.id
                            }
                        })
                        .then(function (student) {
                            if (student) {
                                res.jsonp({
                                    error: "同名学生已经存在"
                                });
                            } else {
                                StudentInfo.update({
                                        name: req.body.name,
                                        address: req.body.address,
                                        mobile: req.body.mobile,
                                        studentNo: req.body.studentNo,
                                        sex: req.body.sex,
                                        School: req.body.School,
                                        className: req.body.className,
                                        discount: req.body.discount,
                                        gradeId: req.body.gradeId,
                                        gradeName: req.body.gradeName,
                                        accountId: accountId
                                    }, {
                                        where: {
                                            _id: req.body.id
                                        }
                                    })
                                    .then(function (result) {
                                        res.jsonp(result);
                                    });
                            }
                        });
                });

            });
    });

    app.post('/admin/studentInfo/delete', checkLogin);
    app.post('/admin/studentInfo/delete', function (req, res) {
        StudentInfo.update({
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

    app.post('/admin/studentInfo/search', checkLogin);
    app.post('/admin/studentInfo/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        var pPromise;
        if (req.body.mobile) {
            pPromise = StudentAccount.getFilter({
                name: req.body.mobile
            });
        } else {
            pPromise = Promise.resolve();
        }

        pPromise.then(function (account) {
            if (req.body.mobile) {
                filter.accountId = account ? account._id : "";
            }

            StudentInfo.getFiltersWithPage(page, filter).then(function (result) {
                res.jsonp({
                    studentInfos: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
        });
    });

    app.get('/admin/studentInfo/:id', checkLogin);
    app.get('/admin/studentInfo/:id', function (req, res) {
        StudentInfo.getFilter({
                _id: req.params.id
            })
            .then(function (studentInfo) {
                if (studentInfo) {
                    res.jsonp(studentInfo);
                }
            });
    });

    // 优惠券可以根据年级或者班级来发放
    app.post('/admin/studentInfo/searchByGradeClass', checkLogin);
    app.post('/admin/studentInfo/searchByGradeClass', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.trainId) {
            // 根据班级订单设置优惠券
            filter.trainId = req.body.trainId;
            filter.isSucceed = 1;
            if (req.body.name && req.body.name.trim()) {
                filter.studentName = {
                    $like: `%${req.body.name.trim()}%`
                };
            }
            AdminEnrollTrain.getFiltersWithPage(page, filter).then(function (result) {
                res.jsonp({
                    students: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
        } else {
            // 根据年级和姓名设置优惠券
            if (req.body.gradeId) {
                filter.gradeId = req.body.gradeId;
            }
            if (req.body.name && req.body.name.trim()) {
                filter.name = {
                    $like: `%${req.body.name.trim()}%`
                };
            }
            StudentInfo.getFiltersWithPage(page, filter).then(function (result) {
                res.jsonp({
                    students: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
        }
    });
}