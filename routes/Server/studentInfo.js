var StudentInfo = require('../../models/studentInfo.js'),
    AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/studentsList', checkLogin);
    app.get('/admin/studentsList', function(req, res) {
        res.render('Server/studentInfoList.html', {
            title: '>学生管理',
            user: req.session.admin
        });
    });

    app.get('/admin/studentDetail/:id', checkLogin);
    app.get('/admin/studentDetail/:id', function(req, res) {
        res.render('Server/studentDetail.html', {
            title: '>学生管理',
            user: req.session.admin,
            id: req.params.id
        });
    });

    app.get('/admin/studentScore/:id/:fromPage', checkLogin);
    app.get('/admin/studentScore/:id/:fromPage', function(req, res) {
        res.render('Server/studentScore.html', {
            title: '>学生成绩',
            user: req.session.admin,
            id: req.params.id,
            fromPage: req.params.fromPage
        });
    });


    app.post('/admin/studentInfo/edit', checkLogin);
    app.post('/admin/studentInfo/edit', function(req, res) {
        StudentInfo.getFilter({ accountId: req.body.accountId, name: req.body.name, _id: { $ne: req.body.id } })
            .then(function(student) {
                if (student) {
                    res.jsonp({ error: "此学生已经存在" });
                } else {
                    var studentInfo = new StudentInfo({
                        name: req.body.name,
                        address: req.body.address,
                        mobile: req.body.mobile,
                        studentNo: req.body.studentNo,
                        sex: req.body.sex,
                        School: req.body.School,
                        className: req.body.className,
                        discount: req.body.discount,
                        gradeId: req.body.gradeId,
                        gradeName: req.body.gradeName
                    });

                    studentInfo.update(req.body.id, function(err, studentInfo) {
                        if (err) {
                            studentInfo = {};
                        }
                        res.jsonp(studentInfo);
                    });
                }
            });
    });

    app.post('/admin/studentInfo/delete', checkLogin);
    app.post('/admin/studentInfo/delete', function(req, res) {
        StudentInfo.delete(req.body.id, function(err, studentInfo) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/studentInfo/search', checkLogin);
    app.post('/admin/studentInfo/search', function(req, res) {
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
        if (req.body.mobile) {
            var reg = new RegExp(req.body.mobile, 'i')
            filter.mobile = { $regex: reg };
        }

        StudentInfo.getAll(null, page, filter, function(err, studentInfos, total) {
            if (err) {
                studentInfos = [];
            }
            res.jsonp({
                studentInfos: studentInfos,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + studentInfos.length) == total
            });
        });
    });

    app.get('/admin/studentInfo/:id', checkLogin);
    app.get('/admin/studentInfo/:id', function(req, res) {
        StudentInfo.get(req.params.id).then(function(studentInfo) {
            if (studentInfo) {
                res.jsonp(studentInfo);
            }
        });
    });

    app.post('/admin/studentInfo/searchByGradeClass', checkLogin);
    app.post('/admin/studentInfo/searchByGradeClass', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.trainId) {
            filter.trainId = req.body.trainId;
            if (req.body.name) {
                var reg = new RegExp(req.body.name, 'i')
                filter.studentName = {
                    $regex: reg
                };
            }
            AdminEnrollTrain.getAllOfStudent(null, page, filter, function(err, adminEnrollTrains, total) {
                if (err) {
                    adminEnrollTrains = [];
                }
                res.jsonp({
                    students: adminEnrollTrains,
                    total: total,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 14 + adminEnrollTrains.length) == total
                });
            });
        } else {
            filter.gradeId = req.body.gradeId;
            if (req.body.name) {
                var reg = new RegExp(req.body.name, 'i')
                filter.name = {
                    $regex: reg
                };
            }
            StudentInfo.getAllOfStudent(null, page, filter, function(err, studentInfos, total) {
                if (err) {
                    studentInfos = [];
                }
                res.jsonp({
                    students: studentInfos,
                    total: total,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 14 + studentInfos.length) == total
                });
            });
        }
    });
}