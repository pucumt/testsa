var TrainClass = require('../../models/trainClass.js'),
    Year = require('../../models/year.js'),
    Grade = require('../../models/grade.js'),
    Subject = require('../../models/subject.js'),
    Category = require('../../models/category.js'),
    ExamCategory = require('../../models/examCategory.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/trainClassList', checkLogin);
    app.get('/admin/trainClassList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        TrainClass.getAll(null, page, {}, function(err, trainClasss, total) {
            if (err) {
                trainClasss = [];
            }
            res.render('Server/trainClassList.html', {
                title: '>课程设置',
                user: req.session.user,
                trainClasss: trainClasss,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + trainClasss.length) == total
            });
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
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName,
            minScore: req.body.minScore
        });

        trainClass.save(function(err, trainClass) {
            if (err) {
                trainClass = {};
            }
            res.jsonp(trainClass);
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
            courseStartDate: req.body.courseStartDate,
            courseEndDate: req.body.courseEndDate,
            courseTime: req.body.courseTime,
            courseContent: req.body.courseContent,
            classRoomId: req.body.classRoomId,
            classRoomName: req.body.classRoomName,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea,
            examCategoryId: req.body.examCategoryId,
            examCategoryName: req.body.examCategoryName,
            minScore: req.body.minScore
        });

        trainClass.update(req.body.id, function(err, trainClass) {
            if (err) {
                trainClass = {};
            }
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

    app.get('/admin/trainClass/yeargradesubjectcategoryexamCategory', checkLogin);
    app.get('/admin/trainClass/yeargradesubjectcategoryexamCategory', function(req, res) {
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
        var p4 = ExamCategory.getAllWithoutPage()
            .then(function(categorys) {
                objReturn.examCategorys = categorys;
            })
            .catch((err) => {
                console.log('errored');
            });
        Promise.all([p0, p1, p2, p3, p4]).then(function() {
                res.jsonp(objReturn);
            })
            .catch((err) => {
                console.log('errored');
            });
    });

    app.get('/admin/trainClass/gradesubject', checkLogin);
    app.get('/admin/trainClass/gradesubject', function(req, res) {
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
        Promise.all([p1, p2]).then(function() {
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
}