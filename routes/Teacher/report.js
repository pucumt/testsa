var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    AdminEnrollTrain = model.adminEnrollTrain,
    SchoolArea = model.schoolArea,
    TrainClass = model.trainClass,
    Subject = model.subject,
    Grade = model.grade,
    Category = model.category,
    Year = model.year,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/Teacher/peopleCountList', checkLogin);
    app.get('/Teacher/peopleCountList', function (req, res) {
        res.render('Teacher/peopleCountList.html', {
            title: '>人数统计',
            user: req.session.teacher
        });
    });

    app.get('/Teacher/schoolArea/all', checkLogin);
    app.get('/Teacher/schoolArea/all', function (req, res) {
        SchoolArea.getFilters({})
            .then(function (schoolAreas) {
                res.jsonp(schoolAreas);
            });
    });

    app.get('/Teacher/grade/getAll', checkLogin);
    app.get('/Teacher/grade/getAll', function (req, res) {
        Grade.getFilters({}).then(function (grades) {
            res.jsonp(grades);
        });
    });

    app.get('/Teacher/subject/getAllWithoutPage', checkLogin);
    app.get('/Teacher/subject/getAllWithoutPage', function (req, res) {
        Subject.getFilters({})
            .then(function (subjects) {
                res.jsonp(subjects);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    app.get('/Teacher/category/all', checkLogin);
    app.get('/Teacher/category/all', function (req, res) {
        Category.getFilters({})
            .then(function (categories) {
                res.jsonp(categories);
            });
    });

    app.get('/Teacher/adminEnrollTrain/orderlist/:id', checkLogin);
    app.get('/Teacher/adminEnrollTrain/orderlist/:id', function (req, res) {
        res.render('Teacher/singleClassOrderList.html', {
            title: '>课程详细订单',
            user: req.session.teacher,
            id: req.params.id
        });
    });

    app.post('/Teacher/peopleCountList/search', checkLogin);
    app.post('/Teacher/peopleCountList/search', function (req, res) {
        var list = [],
            filter = {
                schoolId: req.body.schoolId,
                yearId: global.currentYear._id
            };
        if (req.body.gradeId && req.body.gradeId != '[""]') {
            filter.gradeId = {
                $in: JSON.parse(req.body.gradeId)
            };
        }

        if (req.body.subjectId) {
            filter.subjectId = req.body.subjectId;
        }

        if (req.body.categoryId) {
            filter.categoryId = req.body.categoryId;
        }
        TrainClass.getFilters(filter)
            .then(function (trainClasses) {
                if (trainClasses && trainClasses.length > 0) {
                    var totalEnrollCount = 0;
                    trainClasses.forEach(function (trainClass) {
                        totalEnrollCount += trainClass.enrollCount;
                        list.push({
                            _id: trainClass._id,
                            name: trainClass.name,
                            enrollCount: trainClass.enrollCount,
                            totalStudentCount: trainClass.totalStudentCount
                        });
                    });
                    list.push({
                        _id: "",
                        name: "总报名人数",
                        enrollCount: totalEnrollCount,
                        totalStudentCount: ""
                    });
                }
                res.json(list);
            });
    });

    app.post('/Teacher/adminEnrollTrain/search', checkLogin);
    app.post('/Teacher/adminEnrollTrain/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.studentName && req.body.studentName.trim()) {
            filter.studentName = {
                $like: `%${req.body.studentName.trim()}%`
            };
        }
        if (req.body.className) {
            filter.trainName = req.body.className;
        }
        if (req.body.trainId) {
            filter.trainId = req.body.trainId;
        }
        if (req.body.isSucceed) {
            filter.isSucceed = req.body.isSucceed;
        }
        if (req.body.isPayed) {
            filter.isPayed = (req.body.isPayed == "true" ? true : false);
        }
        if (req.body.studentId) {
            filter.studentId = req.body.studentId;
        }
        if (req.body.yearId) {
            filter.yearId = req.body.yearId;
        }
        if (req.body.orderId) {
            filter._id = req.body.orderId;
        }
        AdminEnrollTrain.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                adminEnrollTrains: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        }).catch(err => {

        });
    });
}