var StudentInfo = require('../../models/studentInfo.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/studentInfoList', checkLogin);
    app.get('/admin/studentInfoList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        StudentInfo.getAll(null, page, {}, function(err, studentInfos, total) {
            if (err) {
                studentInfos = [];
            }
            res.render('Server/studentInfoList.html', {
                title: '>校区列表',
                user: req.session.user,
                studentInfos: studentInfos,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + studentInfos.length) == total
            });
        });
    });

    app.post('/admin/studentInfo/add', checkLogin);
    app.post('/admin/studentInfo/add', function(req, res) {
        var studentInfo = new StudentInfo({
            name: req.body.name,
            address: req.body.address
        });

        studentInfo.save(function(err, studentInfo) {
            if (err) {
                studentInfo = {};
            }
            res.jsonp(studentInfo);
        });
    });

    app.post('/admin/studentInfo/edit', checkLogin);
    app.post('/admin/studentInfo/edit', function(req, res) {
        var studentInfo = new StudentInfo({
            name: req.body.name,
            address: req.body.address,
            School: req.body.address
        });

        studentInfo.update(req.body.id, function(err, studentInfo) {
            if (err) {
                studentInfo = {};
            }
            res.jsonp(studentInfo);
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
}