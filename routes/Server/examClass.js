var ExamClass = require('../../models/examClass.js'),
    ExamClassExamArea = require('../../models/examClassExamArea.js'),
    ExamArea = require('../../models/examArea.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/examClassList', checkLogin);
    app.get('/admin/examClassList', function(req, res) {
        res.render('Server/examClassList.html', {
            title: '>测试设置',
            user: req.session.admin
        });
    });

    app.post('/admin/examClass/add', checkLogin);
    app.post('/admin/examClass/add', function(req, res) {
        var examClass = new ExamClass({
            name: req.body.name,
            examDate: req.body.examDate,
            examTime: req.body.examTime,
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName,
            examCount: req.body.examCount,
            sequence: req.body.sequence,
            enrollCount: 0,
            isWeixin: 0,
            courseContent: req.body.courseContent,
            subjects: (req.body.subjects ? JSON.parse(req.body.subjects) : [])
                // examAreaId: req.body.examAreaId,
                // examAreaName: req.body.examAreaName
        });

        examClass.save(function(err, examClass) {
            if (err) {
                examClass = {};
            }
            if (req.body.examAreas) {
                var examAreas = JSON.parse(req.body.examAreas);
                var pArray = [];
                examAreas.forEach(function(examArea) {
                    var newExamArea = new ExamClassExamArea({
                        examId: examClass._id,
                        examCount: examArea.areaCount,
                        enrollCount: 0,
                        examAreaId: examArea.examAreaId,
                        examAreaName: examArea.examAreaName
                    });
                    pArray.push(newExamArea.save());
                });

                Promise.all(pArray).then(function() {
                    ExamClassExamArea.getFilters({ examId: examClass._id })
                        .then(function(examClassExamAreas) {
                            examClass.examAreas = examClassExamAreas;
                            res.jsonp(examClass);
                        });
                });
            } else {
                res.jsonp(examClass);
            }
        });
    });

    app.post('/admin/examClass/edit', checkLogin);
    app.post('/admin/examClass/edit', function(req, res) {
        var examClass = new ExamClass({
            name: req.body.name,
            examDate: req.body.examDate,
            examTime: req.body.examTime,
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName,
            examCount: req.body.examCount,
            sequence: req.body.sequence,
            courseContent: req.body.courseContent,
            subjects: (req.body.subjects ? JSON.parse(req.body.subjects) : [])
                // examAreaId: req.body.examAreaId,
                // examAreaName: req.body.examAreaName
        });

        examClass.update(req.body.id, function(err, examClass) {
            if (err) {
                examClass = {};
            }
            if (req.body.examAreas) {
                var examAreas = JSON.parse(req.body.examAreas);

                ExamArea.getAllWithoutPage().then(function(allExamAreas) {
                    var pArray = [],
                        selectArea;
                    allExamAreas.forEach(function(singleExamArea) {
                        var p = ExamClassExamArea.getFilter({ examId: examClass._id, examAreaId: singleExamArea._id })
                            .then(function(examClassExamArea) {
                                selectArea = null;
                                if (examClassExamArea) { //已经存在
                                    if (examAreas.some(function(area) {
                                            if (area.examAreaId == singleExamArea._id) {
                                                selectArea = area;
                                                return true;
                                            }
                                        })) {
                                        //需要修改
                                        var newExamClassExamArea = new ExamClassExamArea({
                                            examCount: selectArea.areaCount //
                                        });
                                        return newExamClassExamArea.update(examClassExamArea._id);
                                    } else {
                                        //需要删除
                                        return ExamClassExamArea.delete(examClassExamArea._id);
                                    }
                                } else { //原来没有
                                    if (examAreas.some(function(area) {
                                            if (area.examAreaId == singleExamArea._id) {
                                                selectArea = area;
                                                return true;
                                            }
                                        })) {
                                        //需要新增
                                        var newExamClassExamArea = new ExamClassExamArea({
                                            examId: examClass._id,
                                            examCount: selectArea.areaCount, //
                                            enrollCount: 0,
                                            examAreaId: selectArea.examAreaId,
                                            examAreaName: selectArea.examAreaName
                                        });
                                        return newExamClassExamArea.save();
                                    } else {
                                        //不需要动
                                    }
                                }
                            });
                        pArray.push(p);
                    });

                    Promise.all(pArray).then(function() {
                        ExamClassExamArea.getFilters({ examId: examClass._id })
                            .then(function(examClassExamAreas) {
                                examClass.examAreas = examClassExamAreas;
                                res.jsonp(examClass);
                            });
                    });
                });
            } else {
                ExamClassExamArea.deleteFilter({ examId: examClass._id });
                res.jsonp(examClass);
            }
        });
    });

    app.post('/admin/examClass/delete', checkLogin);
    app.post('/admin/examClass/delete', function(req, res) {
        ExamClass.delete(req.body.id, function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClass/publish', checkLogin);
    app.post('/admin/examClass/publish', function(req, res) {
        ExamClass.publish(req.body.id, function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClass/publishAll', checkLogin);
    app.post('/admin/examClass/publishAll', function(req, res) {
        ExamClass.publishAll(JSON.parse(req.body.ids), function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClass/unPublish', checkLogin);
    app.post('/admin/examClass/unPublish', function(req, res) {
        ExamClass.unPublish(req.body.id, function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClass/unPublishAll', checkLogin);
    app.post('/admin/examClass/unPublishAll', function(req, res) {
        ExamClass.unPublishAll(JSON.parse(req.body.ids), function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examClass/showScore', checkLogin);
    app.post('/admin/examClass/showScore', function(req, res) {
        ExamClass.showScore(req.body.id, req.body.isScorePublished, function(err, examClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });
    app.post('/admin/examClass/search', checkLogin);
    app.post('/admin/examClass/search', function(req, res) {
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

        ExamClass.getAll(null, page, filter, function(err, examClasss, total) {
            if (err) {
                examClasss = [];
            }
            res.jsonp({
                examClasss: examClasss,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + examClasss.length) == total
            });
        });
    });
}