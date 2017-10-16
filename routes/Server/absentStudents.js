var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    AbsentStudents = model.absentStudents,
    AbsentClass = model.absentClass,
    auth = require("./authRollCall"),
    moment = require("moment"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/adminRollCallList', checkLogin);
    app.get('/admin/adminRollCallList', function (req, res) {
        res.render('Server/adminRollCallList.html', {
            title: '>缺席学生列表',
            user: req.session.adminRollCall
        });
    });

    app.post('/admin/absentStudentsList/search', checkLogin);
    app.post('/admin/absentStudentsList/search', function (req, res) {

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

        AbsentStudents.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                absentStudents: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/absentStudents/comment', checkLogin);
    app.post('/admin/absentStudents/comment', function (req, res) {
        var option = {
            comment: req.body.comment
        };
        if (req.body.isCheck == "1") {
            option.isCheck = true;
        }
        AbsentStudents.update(option, {
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

    app.get('/admin/adminRollCallClassList', checkLogin);
    app.get('/admin/adminRollCallClassList', function (req, res) {
        res.render('Server/adminRollCallClassList.html', {
            title: '>点名课程列表',
            user: req.session.adminRollCall
        });
    });

    app.post('/admin/adminRollCallClassList/search', checkLogin);
    app.post('/admin/adminRollCallClassList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        if (req.body.isDeleted) {
            filter.isDeleted = (req.body.isDeleted == "1" ? true : false);
        }

        var dayStr = moment().format("YYYY-MM-DD");
        filter.createdDate = {
            $gte: dayStr + " " + req.body.startDate,
            $lte: dayStr + " " + req.body.endDate
        };

        AbsentClass.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                absentClasses: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/adminRollCallClassList/cancel', checkLogin);
    app.post('/admin/adminRollCallClassList/cancel', function (req, res) {
        AbsentClass.update({
                isDeleted: true,
                deletedBy: req.session.adminRollCall._id,
                deletedDate: new Date()
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

    app.post('/admin/adminRollCallClassList/recover', checkLogin);
    app.post('/admin/adminRollCallClassList/recover', function (req, res) {
        AbsentClass.update({
                isDeleted: false
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

    app.post('/admin/adminRollCallClassList/schoolArea', checkLogin);
    app.post('/admin/adminRollCallClassList/schoolArea', function (req, res) {
        res.jsonp([{
            _id: req.session.adminRollCall.schoolId,
            name: req.session.adminRollCall.schoolArea
        }]);
    });

    app.post('/admin/adminRollCallClassList/clearAll', checkLogin);
    app.post('/admin/adminRollCallClassList/clearAll', function (req, res) {
        // AbsentClass.delete({}).then(function() {
        //     AbsentStudents.delete({}).then(function() {
        //         res.jsonp({ sucess: true });
        //     })
        // });
    });
}