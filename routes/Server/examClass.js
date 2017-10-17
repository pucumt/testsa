var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ExamClass = model.examClass,
    ExamClassSubject = model.examClassSubject,
    ExamClassExamArea = model.examClassExamArea,
    ExamArea = model.examArea,
    Subject = model.subject,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/examClassList', checkLogin);
    app.get('/admin/examClassList', function (req, res) {
        res.render('Server/examClassList.html', {
            title: '>测试设置',
            user: req.session.admin
        });
    });

    app.post('/admin/examClass/add', checkLogin);
    app.post('/admin/examClass/add', function (req, res) {
        // 1. 添加考试课程
        // 2. 添加考试科目
        // 3. 添加考试场地
        model.db.sequelize.transaction(function (t1) {
                return ExamClass.create({
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
                        createdBy: req.session.admin._id
                    }, {
                        transaction: t1
                    })
                    .then(function (resultExam) {
                        var subjects = (req.body.subjects ? JSON.parse(req.body.subjects) : []),
                            p;

                        if (subjects.length > 0) {
                            subjects.forEach(function (subject) {
                                subject.examId = resultExam._id;
                                subject._id = model.db.generateId();
                            });
                            p = ExamClassSubject.bulkCreate(subjects, {
                                transaction: t1
                            });
                        } else {
                            p = Promise.all([]);
                        }

                        return p.then(function () {
                            var examAreas = JSON.parse(req.body.examAreas);
                            examAreas.forEach(function (examArea) {
                                examArea.examId = resultExam._id;
                                examArea._id = model.db.generateId();
                            });
                            return ExamClassExamArea.bulkCreate(examAreas, {
                                transaction: t1
                            });
                        });
                    });
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function () {
                res.jsonp({
                    error: "添加失败"
                });
            });
    });

    app.post('/admin/examClass/edit', checkLogin);
    app.post('/admin/examClass/edit', function (req, res) {
        // 1. 修改考试课程
        // 2. 修改考试科目
        // 3. 修改考试场地
        var subjects = (req.body.subjects ? JSON.parse(req.body.subjects) : []),
            examAreas = JSON.parse(req.body.examAreas),
            toCreateSubjects = [],
            toDeleteSubjectIds = [],
            toCreateAreas = [],
            toUpdateAreas = [],
            toDeleteAreaIds = [];
        var p1 = ExamClassSubject.getFilters({
                examId: req.body.id
            })
            .then(orgSubjects => {
                subjects.forEach(subject => {
                    if (!orgSubjects.some(orgSubject => {
                            return orgSubject.subjectId == subject.subjectId;
                        })) {
                        // 原来没有的科目
                        subject._id = model.db.generateId();
                        subject.examId = req.body.id;
                        toCreateSubjects.push(subject);
                    }
                });
                orgSubjects.forEach(orgSubject => {
                    if (!subjects.some(subject => {
                            return orgSubject.subjectId == subject.subjectId;
                        })) {
                        // 要被删除的科目
                        toDeleteSubjectIds.push(orgSubject._id);
                    }
                });
            });

        var p2 = ExamClassExamArea.getFilters({
                examId: req.body.id
            })
            .then(orgExams => {
                examAreas.forEach(examArea => {
                    var updateExam;
                    if (orgExams.some(orgExam => {
                            if (orgExam.examAreaId == examArea.examAreaId) {
                                orgExam.examCount = examArea.examCount;
                                updateExam = orgExam;
                                return true;
                            }
                        })) {
                        // 更新的考场
                        toUpdateAreas.push(updateExam);
                    } else {
                        // 新建的考场
                        examArea._id = model.db.generateId();
                        examArea.examId = req.body.id;
                        toCreateAreas.push(examArea);
                    }
                });

                orgExams.forEach(orgExam => {
                    if (!toUpdateAreas.some(examArea => {
                            return orgExam.examAreaId == examArea.examAreaId;
                        })) {
                        // 删除的考场
                        toDeleteAreaIds.push(orgExam._id);
                    }
                });
            });
        Promise.all([p1, p2])
            .then(function () {
                model.db.sequelize.transaction(function (t1) {
                        return ExamClass.update({
                                name: req.body.name,
                                examDate: req.body.examDate,
                                examTime: req.body.examTime,
                                examCategoryId: req.body.examCategoryId,
                                examCategoryName: req.body.examCategoryName,
                                examCount: req.body.examCount,
                                sequence: req.body.sequence,
                                courseContent: req.body.courseContent,
                                subjects: (req.body.subjects ? JSON.parse(req.body.subjects) : [])
                            }, {
                                where: {
                                    _id: req.body.id
                                },
                                transaction: t1
                            })
                            .then(function (resultExam) {
                                // 科目
                                var pArray = [];
                                if (toCreateSubjects.length > 0) {
                                    var p = ExamClassSubject.bulkCreate(toCreateSubjects, {
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                if (toDeleteSubjectIds.length > 0) {
                                    var p = ExamClassSubject.update({
                                        isDeleted: true,
                                        deletedBy: req.session.admin._id,
                                        deletedDate: new Date()
                                    }, {
                                        where: {
                                            _id: {
                                                $in: toDeleteSubjectIds
                                            }
                                        },
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                // 考试
                                if (toCreateAreas.length > 0) {
                                    var p = ExamClassExamArea.bulkCreate(toCreateAreas, {
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                if (toDeleteAreaIds.length > 0) {
                                    var p = ExamClassExamArea.update({
                                        isDeleted: true,
                                        deletedBy: req.session.admin._id,
                                        deletedDate: new Date()
                                    }, {
                                        where: {
                                            _id: {
                                                $in: toDeleteAreaIds
                                            }
                                        },
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                if (toUpdateAreas.length > 0) {
                                    toUpdateAreas.forEach(area => {
                                        var p = area.save({
                                            transaction: t1
                                        });
                                        pArray.push(p);
                                    });
                                }
                                return Promise.all(pArray);
                            });
                    })
                    .then(function (result) {
                        res.jsonp({
                            sucess: true
                        });
                    })
                    .catch(function () {
                        res.jsonp({
                            error: "修改失败"
                        });
                    });
            });
    });

    app.post('/admin/examClass/delete', checkLogin);
    app.post('/admin/examClass/delete', function (req, res) {
        ExamClass.update({
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

    app.post('/admin/examClass/publish', checkLogin);
    app.post('/admin/examClass/publish', function (req, res) {
        ExamClass.update({
                isWeixin: 1
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.post('/admin/examClass/publishAll', checkLogin);
    app.post('/admin/examClass/publishAll', function (req, res) {
        ExamClass.update({
                isWeixin: 1
            }, {
                where: {
                    _id: {
                        $in: JSON.parse(req.body.ids)
                    }
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.post('/admin/examClass/unPublish', checkLogin);
    app.post('/admin/examClass/unPublish', function (req, res) {
        ExamClass.update({
                isWeixin: 9
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.post('/admin/examClass/unPublishAll', checkLogin);
    app.post('/admin/examClass/unPublishAll', function (req, res) {
        ExamClass.update({
                isWeixin: 9
            }, {
                where: {
                    _id: {
                        $in: JSON.parse(req.body.ids)
                    }
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });

    app.post('/admin/examClass/showScore', checkLogin);
    app.post('/admin/examClass/showScore', function (req, res) {
        ExamClass.update({
                isScorePublished: (req.body.isScorePublished == "true" ? false : true)
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            })
            .catch(function (err) {
                res.jsonp({
                    error: err
                });
            });
    });
    app.post('/admin/examClass/search', checkLogin);
    app.post('/admin/examClass/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        ExamClass.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                examClasss: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/examClassSubject/getAllWithoutPage', checkLogin);
    app.post('/admin/examClassSubject/getAllWithoutPage', function (req, res) {
        Subject.getFilters({})
            .then(function (subjects) {
                ExamClassSubject.getFilters({
                        examId: req.body.examId
                    })
                    .then(function (examClassSubjects) {
                        res.jsonp({
                            subjects: subjects,
                            examClassSubjects: examClassSubjects
                        });
                    });
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.post('/admin/examClassSubject/id', checkLogin);
    app.post('/admin/examClassSubject/id', function (req, res) {
        ExamClassSubject.getFilters({
                examId: req.body.examId
            })
            .then(function (examClassSubjects) {
                res.jsonp(examClassSubjects);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });
}