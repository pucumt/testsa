var Course = require('../../models/course.js');

module.exports = function(app) {
    app.get('/enroll', function(req, res) {
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Course.get20(null, page, {
            isPassed: true
        }, function(err, posts, total) {
            if (err) {
                posts = [];
            }
            //test code
            courses = [{
                    shortid: 1,
                    title: "test title1",
                    price: "100",
                    imgFile: "...",
                    courseStartDate: new Date(),
                    courseEndDate: new Date(),
                    courseTime: "周一下午13:30-15:00",
                    courseAddress: "徐汇区柳州路教学点"
                },
                {
                    shortid: 2,
                    title: "test title2",
                    price: "120",
                    imgFile: "...",
                    courseStartDate: new Date(),
                    courseEndDate: new Date(),
                    courseTime: "周一下午13:30-15:00",
                    courseAddress: "徐汇区柳州路教学点"
                }
            ];
            res.render('Client/enroll.html', {
                title: '我要报名',
                courses: courses,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 20 + courses.length) == total,
                user: req.session.user
            });
        });
    });

    app.get('/enrollfilter', function(req, res) {
        res.render('Client/enroll-filter.html', {
            title: '选课程',
            user: req.session.user
        });
    });

    app.post('/enroll', function(req, res) {
        // number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Course.get20(null, page, {
            isPassed: true
        }, function(err, posts, total) {
            if (err) {
                posts = [];
            }
            //test code
            courses = [{
                    shortid: 1,
                    title: "活动类托班综合托班宝宝能力评估(2020幼升小)",
                    price: "100",
                    imgFile: "...",
                    courseStartDate: new Date(),
                    courseEndDate: new Date(),
                    courseTime: "周一下午13:30-15:00",
                    courseAddress: "徐汇区柳州路教学点"
                },
                {
                    shortid: 2,
                    title: "活动类托班综合托班宝宝能力评估(2020幼升小)",
                    price: "120",
                    imgFile: "...",
                    courseStartDate: new Date(),
                    courseEndDate: new Date(),
                    courseTime: "周一下午13:30-15:00",
                    courseAddress: "徐汇区柳州路教学点"
                }
            ];
            res.render('Client/enroll.html', {
                title: '我要报名',
                courses: courses,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 20 + courses.length) == total,
                user: req.session.user
            });
        });
    });

    app.get('/enrolldetail/:id', function(req, res) {
        //查询并返回id的文章
        Course.getOne(req.params.id, function(err, course) {
            if (err) {
                course = {};
            }
            course = {
                shortid: 1,
                title: "活动类托班综合托班宝宝能力评估(2020幼升小)",
                price: "100",
                imgFile: "...",
                courseStartDate: new Date(),
                courseEndDate: new Date(),
                courseTime: "周一下午13:30-15:00",
                courseAddress: "徐汇区柳州路教学点",
                courseContent: "这是一节体验课程"
            };
            res.render('Client/enroll-detail.html', {
                title: '文章',
                course: course
            });
        });
    });
};