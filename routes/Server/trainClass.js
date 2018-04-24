var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    TrainClass = model.trainClass,
    TrainClassExam = model.trainClassExams,
    Year = model.year,
    Grade = model.grade,
    Subject = model.subject,
    Category = model.category,
    SchoolArea = model.schoolArea,
    ExamCategory = model.examCategory,
    ExamClass = model.examClass,
    ClassAttribute = model.classAttribute,
    AdminEnrollTrain = model.adminEnrollTrain,
    SchoolGradeRelation = model.schoolGradeRelation,
    GradeSubjectRelation = model.gradeSubjectRelation,
    GradeSubjectCategoryRelation = model.gradeSubjectCategoryRelation,
    RollCallConfigure = model.rollCallConfigure,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/trainClassList', checkLogin);
    app.get('/admin/trainClassList', auth.checkSecure([0, 3, 7, 8]));
    app.get('/admin/trainClassList', function (req, res) {
        res.render('Server/trainClassList.html', {
            title: '>课程设置',
            user: req.session.admin
        });
    });

    app.get('/admin/batchTrainClass', checkLogin);
    app.get('/admin/batchTrainClass', function (req, res) {
        res.render('Server/batchTrainClass.html', {
            title: '>课程批量上传',
            user: req.session.admin
        });
    });

    app.get('/admin/batchTrainClasspublish', checkLogin);
    app.get('/admin/batchTrainClasspublish', function (req, res) {
        res.render('Server/batchTrainClassPublish.html', {
            title: '>课程批量发布',
            user: req.session.admin
        });
    });

    app.get('/admin/batchAddStudentToTrainClass', checkLogin);
    app.get('/admin/batchAddStudentToTrainClass', function (req, res) {
        res.render('Server/batchAddStudentToTrainClass.html', {
            title: '>批量添加学生到课程',
            user: req.session.admin
        });
    });

    app.get('/admin/batchAddTeacherToTrainClass', checkLogin);
    app.get('/admin/batchAddTeacherToTrainClass', function (req, res) {
        res.render('Server/batchAddTeacherToTrainClass.html', {
            title: '>批量添加老师教室到课程',
            user: req.session.admin
        });
    });

    app.post('/admin/trainClass/add', checkLogin);
    app.post('/admin/trainClass/add', function (req, res) {
        var option = {
            name: req.body.name,
            subjectId: req.body.subjectId,
            subjectName: req.body.subjectName,
            totalStudentCount: req.body.totalStudentCount, // 招生人数
            courseContent: req.body.courseContent,
            isWeixin: 0,
            enrollCount: 0,
            createdBy: req.session.admin._id
        };
        model.db.sequelize.transaction(function (t1) {
                return TrainClass.create(option, {
                        transaction: t1
                    })
                    .then(function (result) {
                        var exams = JSON.parse(req.body.exams);
                        if (exams.length > 0) {
                            exams.forEach(function (exam) {
                                exam.trainClassId = result._id;
                                exam._id = model.db.generateId();
                            });
                            return TrainClassExam.bulkCreate(exams, {
                                transaction: t1
                            }).then(function () {
                                return result;
                            });
                        }
                    });
            })
            .then(function (result) {
                res.jsonp(result);
            })
            .catch(function () {
                res.jsonp({
                    error: "创建失败"
                });
            });
    });

    app.post('/admin/trainClass/edit', checkLogin);
    app.post('/admin/trainClass/edit', function (req, res) {
        var option = {
                name: req.body.name,
                subjectId: req.body.subjectId,
                subjectName: req.body.subjectName,
                totalStudentCount: req.body.totalStudentCount, //招生人数
                courseContent: req.body.courseContent,
            },
            exams = JSON.parse(req.body.exams),
            toCreateExams = [],
            toUpdateExams = [],
            toDeleteExamIds = [];
        TrainClassExam.getFilters({
                trainClassId: req.body.id
            })
            .then(function (orgExams) {
                exams.forEach(function (exam) {
                    var updateExam = null;
                    if (orgExams.some(orgExam => {
                            if (orgExam.examName == exam.examName) {
                                orgExam.minScore = exam.minScore;
                                orgExam.minCount = exam.minCount;
                                updateExam = orgExam;
                                return true;
                            }
                        })) {
                        // 更新的考试成绩
                        toUpdateExams.push(updateExam);
                    } else {
                        // 新建的考试成绩
                        exam._id = model.db.generateId();
                        exam.trainClassId = req.body.id;
                        exam.createdBy = req.session.admin._id;
                        toCreateExams.push(exam);
                    }
                });

                orgExams.forEach(orgExam => {
                    if (!toUpdateExams.some(exam => {
                            return orgExam.examName == exam.examName;
                        })) {
                        // 删除的考场
                        toDeleteExamIds.push(orgExam._id);
                    }
                });
                model.db.sequelize.transaction(function (t1) {
                        return TrainClass.update(option, {
                                where: {
                                    _id: req.body.id
                                },
                                transaction: t1
                            })
                            .then(function (resultClass) {
                                var pArray = [];
                                if (toCreateExams.length > 0) {
                                    var p = TrainClassExam.bulkCreate(toCreateExams, {
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                if (toDeleteExamIds.length > 0) {
                                    var p = TrainClassExam.update({
                                        isDeleted: true,
                                        deletedBy: req.session.admin._id,
                                        deletedDate: new Date()
                                    }, {
                                        where: {
                                            _id: {
                                                $in: toDeleteExamIds
                                            }
                                        },
                                        transaction: t1
                                    });
                                    pArray.push(p);
                                }
                                if (toUpdateExams.length > 0) {
                                    toUpdateExams.forEach(exam => {
                                        var p = exam.save({
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

    app.post('/admin/trainClass/delete', checkLogin);
    app.post('/admin/trainClass/delete', function (req, res) {
        TrainClass.update({
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

    app.get('/admin/trainClass/yeargradesubjectcategoryexamattribute', checkLogin);
    app.get('/admin/trainClass/yeargradesubjectcategoryexamattribute', function (req, res) {
        var objReturn = {};
        var p0 = Year.getFilters({})
            .then(function (years) {
                objReturn.years = years;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p1 = Grade.getFilters({})
            .then(function (grades) {
                objReturn.grades = grades;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p2 = Subject.getFilters({})
            .then(function (subjects) {
                objReturn.subjects = subjects;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p3 = Category.getFilters({})
            .then(function (categorys) {
                objReturn.categorys = categorys;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p4 = ExamClass.getFilters({})
            .then(function (exams) {
                objReturn.exams = exams;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p5 = ClassAttribute.getFilters({})
            .then(function (attributes) {
                objReturn.attributes = attributes;
            })
            .catch(function (err) {
                console.log('errored');
            });
        Promise.all([p0, p1, p2, p3, p4, p5])
            .then(function () {
                res.jsonp(objReturn);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.get('/admin/trainClass/gradesubjectcategoryschoolyearattribute', checkLogin);
    app.get('/admin/trainClass/gradesubjectcategoryschoolyearattribute', function (req, res) {
        var objReturn = {};
        var p1 = Grade.getFilters({})
            .then(function (grades) {
                objReturn.grades = grades;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p2 = Subject.getFilters({})
            .then(function (subjects) {
                objReturn.subjects = subjects;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p3 = Category.getFilters({})
            .then(function (categorys) {
                objReturn.categorys = categorys;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p4 = Year.getFilters({})
            .then(function (years) {
                objReturn.years = years;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p5 = SchoolArea.getFilters({})
            .then(schools => {
                objReturn.schools = schools;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p6 = SchoolGradeRelation.getFilters({})
            .then(function (schoolGradeRelations) {
                objReturn.schoolGradeRelations = schoolGradeRelations;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p7 = GradeSubjectRelation.getFilters({})
            .then(function (gradeSubjectRelations) {
                objReturn.gradeSubjectRelations = gradeSubjectRelations;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p8 = GradeSubjectCategoryRelation.getFilters({})
            .then(function (gradeSubjectCategoryRelations) {
                objReturn.gradeSubjectCategoryRelations = gradeSubjectCategoryRelations;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p9 = model.db.sequelize.query("select R.yearId, A._id, A.name from classAttributes A join yearAttributeRelations R \
            on R.attributeId=A._id where R.isDeleted=false and A.isDeleted=false order by A.sequence ", {
                replacements: {},
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (classAttributes) {
                objReturn.classAttributes = classAttributes;
            })
            .catch(err => {
                console.log('err');
            });
        Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9])
            .then(function () {
                res.jsonp(objReturn);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.get('/admin/trainClass/schoolyearattribute', checkLogin);
    app.get('/admin/trainClass/schoolyearattribute', function (req, res) {
        var objReturn = {};
        var p4 = Year.getFilters({})
            .then(function (years) {
                objReturn.years = years;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p5 = SchoolArea.getFilters({})
            .then(schools => {
                objReturn.schools = schools;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p9 = model.db.sequelize.query("select R.yearId, A._id, A.name from classAttributes A join yearAttributeRelations R \
            on R.attributeId=A._id where R.isDeleted=false and A.isDeleted=false order by A.sequence", {
                replacements: {},
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (classAttributes) {
                objReturn.classAttributes = classAttributes;
            })
            .catch(err => {
                console.log('err');
            });
        Promise.all([p4, p5, p9])
            .then(function () {
                res.jsonp(objReturn);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.get('/admin/trainClass/gradesubjectattribute', checkLogin);
    app.get('/admin/trainClass/gradesubjectattribute', function (req, res) {
        var objReturn = {};
        var p1 = Grade.getFilters({})
            .then(function (grades) {
                objReturn.grades = grades;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p2 = Subject.getFilters({})
            .then(function (subjects) {
                objReturn.subjects = subjects;
            })
            .catch(function (err) {
                console.log('errored');
            });
        var p5 = ClassAttribute.getFilters({})
            .then(function (attributes) {
                objReturn.attributes = attributes;
            })
            .catch(function (err) {
                console.log('errored');
            });
        Promise.all([p1, p2, p5])
            .then(function () {
                res.jsonp(objReturn);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.post('/admin/trainClass/publish', checkLogin);
    app.post('/admin/trainClass/publish', function (req, res) {
        TrainClass.update({
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

    app.post('/admin/trainClass/publishAll', checkLogin);
    app.post('/admin/trainClass/publishAll', function (req, res) {
        TrainClass.update({
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

    app.post('/admin/trainClass/unPublish', checkLogin);
    app.post('/admin/trainClass/unPublish', function (req, res) {
        TrainClass.update({
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

    app.post('/admin/trainClass/originalclass', checkLogin);
    app.post('/admin/trainClass/originalclass', function (req, res) {
        TrainClass.update({
                isWeixin: 2
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

    // 实际订单跟课程里的报名名额显示不一致的时候使用
    app.post('/admin/trainClass/reset', checkLogin);
    app.post('/admin/trainClass/reset', function (req, res) {
        AdminEnrollTrain.getFilters({
            isSucceed: 1,
            trainId: req.body.id
        }).then(function (orders) {
            TrainClass.update({
                    enrollCount: orders.length
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
    });

    // 修改课程名称后要修改订单里的名称
    app.post('/admin/trainClass/updateOrder', checkLogin);
    app.post('/admin/trainClass/updateOrder', function (req, res) {
        TrainClass.getFilter({
                _id: req.body.id
            })
            .then(function (trainClass) {
                AdminEnrollTrain.update({
                        trainName: trainClass.name
                    }, {
                        where: {
                            isSucceed: 1,
                            trainId: req.body.id
                        }
                    })
                    .then(function () {
                        res.jsonp({
                            sucess: true
                        });
                    });
            });
    });

    app.post('/admin/trainClass/unPublishAll', checkLogin);
    app.post('/admin/trainClass/unPublishAll', function (req, res) {
        TrainClass.update({
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

    app.post('/admin/trainClass/deleteAll', checkLogin);
    app.post('/admin/trainClass/deleteAll', function (req, res) {
        TrainClass.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
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

    app.post('/admin/trainClass/search', checkLogin);
    app.post('/admin/trainClass/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.school) {
            filter.schoolArea = req.body.school;
        }
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        if (req.body.gradeName) {
            filter.gradeName = req.body.gradeName;
        }
        if (req.body.grade) {
            filter.gradeId = req.body.grade;
        }
        if (req.body.subject) {
            filter.subjectId = req.body.subject;
        }
        if (req.body.category) {
            filter.categoryId = req.body.category;
        }
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
        }
        if (req.body.yearId) {
            filter.yearId = req.body.yearId;
        } else { //当前年度的课程
            if (global.currentYear) {
                filter.yearId = global.currentYear._id;
            }
        }

        TrainClass.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    trainClasss: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
    });

    app.post('/admin/trainClassWithTeacher/search', checkLogin);
    app.post('/admin/trainClassWithTeacher/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;

        var strSqlMiddle = " from trainClasss C left join teachers T on C.teacherId=T._id where C.isDeleted=false ",
            strSql1 = "select count(0) as count ",
            strSql2 = "select C.*, T.engName ",
            replacements = {};

        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            strSqlMiddle += " and C.name like :name ";
            replacements.name = "%" + req.body.name.trim() + "%";
        }
        if (req.body.school) {
            strSqlMiddle += " and C.schoolArea=:schoolArea ";
            replacements.schoolArea = req.body.school;
        }
        if (req.body.schoolId) {
            strSqlMiddle += " and C.schoolId=:schoolId ";
            replacements.schoolId = req.body.schoolId;
        }
        if (req.body.gradeName) {
            strSqlMiddle += " and C.gradeName=:gradeName ";
            replacements.gradeName = req.body.gradeName;
        }
        if (req.body.grade) {
            strSqlMiddle += " and C.gradeId=:gradeId ";
            replacements.gradeId = req.body.grade;
        }
        if (req.body.subject) {
            strSqlMiddle += " and C.subjectId=:subjectId ";
            replacements.subjectId = req.body.subject;
        }
        if (req.body.category) {
            strSqlMiddle += " and C.categoryId=:categoryId ";
            replacements.categoryId = req.body.category;
        }
        if (req.body.attributeId) {
            strSqlMiddle += " and C.attributeId=:attributeId ";
            replacements.attributeId = req.body.attributeId;
        }
        if (req.body.yearId) {
            strSqlMiddle += " and C.yearId=:yearId ";
            replacements.yearId = req.body.yearId;
        } else { //当前年度的课程
            if (global.currentYear) {
                strSqlMiddle += " and C.yearId=:yearId ";
                replacements.yearId = global.currentYear._id;
            }
        }

        var offset = ((page - 1) * pageSize);
        strSql2 += strSqlMiddle + " order by C.createdDate desc, C._id desc LIMIT " + offset + ", " + pageSize;
        strSql1 += strSqlMiddle;

        model.db.sequelize.query(strSql1, {
                replacements: replacements,
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (counts) {
                if (counts && counts.length > 0) {
                    var total = counts[0].count;
                    model.db.sequelize.query(strSql2, {
                            replacements: replacements,
                            type: model.db.sequelize.QueryTypes.SELECT
                        })
                        .then(orders => {
                            res.jsonp({
                                trainClasss: orders,
                                total: total,
                                page: page,
                                isFirstPage: (page - 1) == 0,
                                isLastPage: (offset + orders.length) == total
                            });
                        });
                }
            });
    });

    app.post('/admin/batchTrainClasspublish', checkLogin);
    app.post('/admin/batchTrainClasspublish', function (req, res) {
        var filter = {
            yearId: req.body.id,
            isDeleted: false
        };
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
        }
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        TrainClass.update({
                isWeixin: 1
            }, {
                where: filter
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

    app.post('/admin/batchTrainClassUnpublish', checkLogin);
    app.post('/admin/batchTrainClassUnpublish', function (req, res) {
        var filter = {
            yearId: req.body.id,
            isDeleted: false
        };
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
        }
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        TrainClass.update({
                isWeixin: 9
            }, {
                where: filter
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

    app.post('/admin/batchAdd100', checkLogin);
    app.post('/admin/batchAdd100', function (req, res) {
        var filter = {
            yearId: req.body.id
        };
        if (req.body.gradeId) {
            filter.gradeId = {
                $ne: req.body.gradeId
            };
        }
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
        }
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        TrainClass.update({
                trainPrice: model.db.sequelize.literal('`trainPrice`+100')
            }, {
                where: filter
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

    app.post('/admin/batchMin100', checkLogin);
    app.post('/admin/batchMin100', function (req, res) {
        var filter = {
            yearId: req.body.id
        };
        if (req.body.gradeId) {
            filter.gradeId = {
                $ne: req.body.gradeId
            };
        }
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
        }
        if (req.body.schoolId) {
            filter.schoolId = req.body.schoolId;
        }
        TrainClass.update({
                trainPrice: model.db.sequelize.literal('`trainPrice`-100')
            }, {
                where: filter
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

    app.post('/admin/adminEnrollTrain/getTrain', checkLogin);
    app.post('/admin/adminEnrollTrain/getTrain', function (req, res) {
        TrainClass.getFilter({
                _id: req.body.id
            })
            .then(function (trainClass) {
                if (trainClass) {
                    res.jsonp(trainClass);
                } else {
                    res.jsonp({
                        error: "没找到订单"
                    });
                    return;
                }
            });
    });

    app.post('/admin/trainClass/getExams', checkLogin);
    app.post('/admin/trainClass/getExams', function (req, res) {
        TrainClassExam.getFilters({
                trainClassId: req.body.id
            })
            .then(function (exams) {
                res.jsonp(exams);
            });
    });

    app.post('/admin/trainClass/classesFromTeacher', checkLogin);
    app.post('/admin/trainClass/classesFromTeacher', function (req, res) {
        //debugger;
        RollCallConfigure.getFilter({})
            .then(function (configure) {
                TrainClass.getFilters({
                        teacherId: req.session.admin._id, // the admin is teacher 
                        yearId: configure.yearId
                    })
                    .then(function (classs) {
                        res.jsonp({
                            classs: classs
                        });
                    });
            });
    });

    app.post('/admin/trainClass/classesFromTeacherOfcurrent', checkLogin);
    app.post('/admin/trainClass/classesFromTeacherOfcurrent', function (req, res) {
        //debugger;
        TrainClass.getFilters({
                teacherId: req.session.admin._id, // the admin is teacher 
                yearId: global.currentYear._id
            })
            .then(function (classs) {
                res.jsonp({
                    classs: classs
                });
            });
    });
}