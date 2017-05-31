var TrainClass = require('../../models/trainClass.js'),
    Year = require('../../models/year.js'),
    Grade = require('../../models/grade.js'),
    Subject = require('../../models/subject.js'),
    Category = require('../../models/category.js'),
    ExamCategory = require('../../models/examCategory.js'),
    ExamClass = require('../../models/examClass.js'),
    ClassAttribute = require('../../models/classAttribute.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/trainClassList', checkLogin);
    app.get('/admin/trainClassList', function(req, res) {
        res.render('Server/trainClassList.html', {
            title: '>课程设置',
            user: req.session.admin
        });
    });

    app.get('/admin/batchTrainClass', checkLogin);
    app.get('/admin/batchTrainClass', function(req, res) {
        res.render('Server/batchTrainClass.html', {
            title: '>课程批量上传',
            user: req.session.admin
        });
    });

    app.get('/admin/batchTrainClasspublish', checkLogin);
    app.get('/admin/batchTrainClasspublish', function(req, res) {
        res.render('Server/batchTrainClassPublish.html', {
            title: '>课程批量发布',
            user: req.session.admin
        });
    });

    app.get('/admin/batchAddStudentToTrainClass', checkLogin);
    app.get('/admin/batchAddStudentToTrainClass', function(req, res) {
        res.render('Server/batchAddStudentToTrainClass.html', {
            title: '>批量添加学生到课程',
            user: req.session.admin
        });
    });

    app.post('/admin/trainClass/add', checkLogin);
    app.post('/admin/trainClass/add', function(req, res) {
        var trainClass = new TrainClass({
            name: req.body.name,
            yearId: req.body.yearId,
            yearName: req.body.yearName,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName,
            subjectId: req.body.subjectId,
            subjectName: req.body.subjectName,
            categoryId: req.body.categoryId,
            categoryName: req.body.categoryName,
            totalStudentCount: req.body.totalStudentCount, //招生人数
            totalClassCount: req.body.totalClassCount, //共多少课时
            trainPrice: req.body.trainPrice,
            materialPrice: req.body.materialPrice,
            teacherId: req.body.teacherId,
            teacherName: req.body.teacherName,
            attributeId: req.body.attributeId,
            attributeName: req.body.attributeName,
            courseStartDate: req.body.courseStartDate,
            courseEndDate: req.body.courseEndDate,
            courseTime: req.body.courseTime,
            courseContent: req.body.courseContent,
            classRoomId: req.body.classRoomId,
            classRoomName: req.body.classRoomName,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea,
            isWeixin: 0,
            enrollCount: 0,
            exams: JSON.parse(req.body.exams)
        });

        trainClass.save().then(function(tclass) {
            res.jsonp(tclass);
        });
    });

    app.post('/admin/trainClass/edit', checkLogin);
    app.post('/admin/trainClass/edit', function(req, res) {
        var trainClass = new TrainClass({
            name: req.body.name,
            yearId: req.body.yearId,
            yearName: req.body.yearName,
            gradeId: req.body.gradeId,
            gradeName: req.body.gradeName,
            subjectId: req.body.subjectId,
            subjectName: req.body.subjectName,
            categoryId: req.body.categoryId,
            categoryName: req.body.categoryName,
            totalStudentCount: req.body.totalStudentCount, //招生人数
            totalClassCount: req.body.totalClassCount, //共多少课时
            trainPrice: req.body.trainPrice,
            materialPrice: req.body.materialPrice,
            teacherId: req.body.teacherId,
            teacherName: req.body.teacherName,
            attributeId: req.body.attributeId,
            attributeName: req.body.attributeName,
            courseStartDate: req.body.courseStartDate,
            courseEndDate: req.body.courseEndDate,
            courseTime: req.body.courseTime,
            courseContent: req.body.courseContent,
            classRoomId: req.body.classRoomId,
            classRoomName: req.body.classRoomName,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea,
            exams: JSON.parse(req.body.exams)
        });

        trainClass.update(req.body.id)
            .then(function() {
                res.jsonp(trainClass);
            });
    });

    app.post('/admin/trainClass/delete', checkLogin);
    app.post('/admin/trainClass/delete', function(req, res) {
        TrainClass.delete(req.body.id, function(err, trainClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.get('/admin/trainClass/yeargradesubjectcategoryexamattribute', checkLogin);
    app.get('/admin/trainClass/yeargradesubjectcategoryexamattribute', function(req, res) {
        var objReturn = {};
        var p0 = Year.getAllWithoutPage()
            .then(function(years) {
                objReturn.years = years;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p1 = Grade.getAllWithoutPage()
            .then(function(grades) {
                objReturn.grades = grades;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p2 = Subject.getAllWithoutPage()
            .then(function(subjects) {
                objReturn.subjects = subjects;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p3 = Category.getAllWithoutPage()
            .then(function(categorys) {
                objReturn.categorys = categorys;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p4 = ExamClass.getAllWithoutPage()
            .then(function(exams) {
                objReturn.exams = exams;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p5 = ClassAttribute.getAllWithoutPage()
            .then(function(attributes) {
                objReturn.attributes = attributes;
            })
            .catch((err) => {
                console.log('errored');
            });
        Promise.all([p0, p1, p2, p3, p4, p5]).then(function() {
                res.jsonp(objReturn);
            })
            .catch((err) => {
                console.log('errored');
            });
    });

    app.get('/admin/trainClass/gradesubjectcategory', checkLogin);
    app.get('/admin/trainClass/gradesubjectcategory', function(req, res) {
        var objReturn = {};
        var p1 = Grade.getAllWithoutPage()
            .then(function(grades) {
                objReturn.grades = grades;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p2 = Subject.getAllWithoutPage()
            .then(function(subjects) {
                objReturn.subjects = subjects;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p3 = Category.getAllWithoutPage()
            .then(function(categorys) {
                objReturn.categorys = categorys;
            })
            .catch((err) => {
                console.log('errored');
            });
        Promise.all([p1, p2, p3]).then(function() {
                res.jsonp(objReturn);
            })
            .catch((err) => {
                console.log('errored');
            });
    });

    app.get('/admin/trainClass/gradesubjectattribute', checkLogin);
    app.get('/admin/trainClass/gradesubjectattribute', function(req, res) {
        var objReturn = {};
        var p1 = Grade.getAllWithoutPage()
            .then(function(grades) {
                objReturn.grades = grades;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p2 = Subject.getAllWithoutPage()
            .then(function(subjects) {
                objReturn.subjects = subjects;
            })
            .catch((err) => {
                console.log('errored');
            });
        var p5 = ClassAttribute.getAllWithoutPage()
            .then(function(attributes) {
                objReturn.attributes = attributes;
            })
            .catch((err) => {
                console.log('errored');
            });
        Promise.all([p1, p2, p5]).then(function() {
                res.jsonp(objReturn);
            })
            .catch((err) => {
                console.log('errored');
            });
    });

    app.post('/admin/trainClass/publish', checkLogin);
    app.post('/admin/trainClass/publish', function(req, res) {
        TrainClass.publish(req.body.id, function(err, trainClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/trainClass/publishAll', checkLogin);
    app.post('/admin/trainClass/publishAll', function(req, res) {
        TrainClass.publishAll(JSON.parse(req.body.ids), function(err, trainClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/trainClass/unPublish', checkLogin);
    app.post('/admin/trainClass/unPublish', function(req, res) {
        TrainClass.unPublish(req.body.id, function(err, trainClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/trainClass/unPublishAll', checkLogin);
    app.post('/admin/trainClass/unPublishAll', function(req, res) {
        TrainClass.unPublishAll(JSON.parse(req.body.ids), function(err, trainClass) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/trainClass/deleteAll', checkLogin);
    app.post('/admin/trainClass/deleteAll', function(req, res) {
        TrainClass.deleteAll(JSON.parse(req.body.ids))
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });

    app.post('/admin/trainClass/search', checkLogin);
    app.post('/admin/trainClass/search', function(req, res) {
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
        if (req.body.school) {
            filter.schoolArea = req.body.school;
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
        if (req.body.yearId) {
            filter.yearId = req.body.yearId;
        } else { //当前年度的课程
            if (global.currentYear) {
                filter.yearId = global.currentYear._id;
            }
        }

        TrainClass.getAll(null, page, filter, function(err, trainClasss, total) {
            if (err) {
                trainClasss = [];
            }
            res.jsonp({
                trainClasss: trainClasss,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + trainClasss.length) == total
            });
        });
    });

    app.post('/admin/batchTrainClasspublish', checkLogin);
    app.post('/admin/batchTrainClasspublish', function(req, res) {
        TrainClass.publishWithYear(req.body.id)
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });

    app.post('/admin/batchTrainClassUnpublish', checkLogin);
    app.post('/admin/batchTrainClassUnpublish', function(req, res) {
        TrainClass.unpublishWithYear(req.body.id)
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });

    app.post('/admin/batchAdd100', checkLogin);
    app.post('/admin/batchAdd100', function(req, res) {
        var filter = {
            yearId: req.body.id
        };
        if (req.body.gradeId) {
            filter.gradeId = { $ne: req.body.gradeId };
        }
        TrainClass.add100(filter)
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });
    app.post('/admin/batchMin100', checkLogin);
    app.post('/admin/batchMin100', function(req, res) {
        var filter = {
            yearId: req.body.id
        };
        if (req.body.gradeId) {
            filter.gradeId = { $ne: req.body.gradeId };
        }
        TrainClass.min100(filter)
            .then(function() {
                res.jsonp({ sucess: true });
            });
    });
}