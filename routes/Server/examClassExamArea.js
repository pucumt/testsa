var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ExamClassExamArea = model.examClassExamArea,
    ExamArea = model.examArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin; // TBD

module.exports = function (app) {
    app.post('/admin/examClassExamArea/withAllexamArea', checkLogin);
    app.post('/admin/examClassExamArea/withAllexamArea', function (req, res) {
        ExamArea.getFilters({})
            .then(function (examAreas) {
                ExamClassExamArea.getFilters({
                    examId: req.body.examId
                }).then(function (examClassExamAreas) {
                    res.jsonp({
                        examAreas: examAreas,
                        examClassExamAreas: examClassExamAreas
                    });
                });
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.post('/admin/examClassExamArea/examAreas', checkLogin);
    app.post('/admin/examClassExamArea/examAreas', function (req, res) {
        ExamClassExamArea.getFilters({
                examId: req.body.examId
            }).then(function (examClassExamAreas) {
                res.jsonp(examClassExamAreas);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    // app.post('/admin/examClassExamArea/add', checkLogin);
    // app.post('/admin/examClassExamArea/add', function(req, res) {
    //     var examClassExamArea = new ExamClassExamArea({
    //         name: req.body.name,
    //         address: req.body.address
    //     });

    //     examClassExamArea.save(function(err, examClassExamArea) {
    //         if (err) {
    //             examClassExamArea = {};
    //         }
    //         res.jsonp(examClassExamArea);
    //     });
    // });

    // app.post('/admin/examClassExamArea/edit', checkLogin);
    // app.post('/admin/examClassExamArea/edit', function(req, res) {
    //     var examClassExamArea = new ExamClassExamArea({
    //         name: req.body.name,
    //         address: req.body.address
    //     });

    //     examClassExamArea.update(req.body.id, function(err, examClassExamArea) {
    //         if (err) {
    //             examClassExamArea = {};
    //         }
    //         res.jsonp(examClassExamArea);
    //     });
    // });

    // app.post('/admin/examClassExamArea/delete', checkLogin);
    // app.post('/admin/examClassExamArea/delete', function(req, res) {
    //     ExamClassExamArea.delete(req.body.id, function(err, examClassExamArea) {
    //         if (err) {
    //             res.jsonp({ error: err });
    //             return;
    //         }
    //         res.jsonp({ sucess: true });
    //     });
    // });

    // app.post('/admin/examClassExamAreaList/search', checkLogin);
    // app.post('/admin/examClassExamAreaList/search', function(req, res) {

    //     //判断是否是第一页，并把请求的页数转换成 number 类型
    //     var page = req.query.p ? parseInt(req.query.p) : 1;
    //     //查询并返回第 page 页的 20 篇文章
    //     var filter = {};
    //     if (req.body.name) {
    //         var reg = new RegExp(req.body.name, 'i')
    //         filter.name = {
    //             $regex: reg
    //         };
    //     }

    //     ExamClassExamArea.getAll(null, page, filter, function(err, examClassExamAreas, total) {
    //         if (err) {
    //             examClassExamAreas = [];
    //         }
    //         res.jsonp({
    //             examClassExamAreas: examClassExamAreas,
    //             total: total,
    //             page: page,
    //             isFirstPage: (page - 1) == 0,
    //             isLastPage: ((page - 1) * 14 + examClassExamAreas.length) == total
    //         });
    //     });
    // });
}