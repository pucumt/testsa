var ExamRoom = require('../../models/examRoom.js'),
    ExamClass = require('../../models/examClass.js'),
    AdminEnrollExam = require('../../models/adminEnrollExam.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/examRoomList', checkLogin);
    app.get('/admin/examRoomList', function(req, res) {
        res.render('Server/examRoomList.html', {
            title: '>考场列表',
            user: req.session.user
        });
    });

    app.post('/admin/examRoom/add', checkLogin);
    app.post('/admin/examRoom/add', function(req, res) {
        var examRoom = new ExamRoom({
            name: req.body.name,
            address: req.body.address
        });

        examRoom.save(function(err, examRoom) {
            if (err) {
                examRoom = {};
            }
            res.jsonp(examRoom);
        });
    });

    app.post('/admin/examRoom/edit', checkLogin);
    app.post('/admin/examRoom/edit', function(req, res) {
        var examRoom = new ExamRoom({
            classRooms: JSON.parse(req.body.classRooms)
        });

        examRoom.update(req.body.id, function(err, examRoom) {
            if (err) {
                examRoom = {};
            }
            res.jsonp(examRoom);
        });
    });

    app.post('/admin/examRoom/delete', checkLogin);
    app.post('/admin/examRoom/delete', function(req, res) {
        ExamRoom.delete(req.body.id, function(err, examRoom) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/admin/examRoomList/search', checkLogin);
    app.post('/admin/examRoomList/search', function(req, res) {

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

        ExamRoom.getAll(null, page, filter, function(err, examRooms, total) {
            if (err) {
                examRooms = [];
            }
            res.jsonp({
                examRooms: examRooms,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + examRooms.length) == total
            });
        });
    });

    app.get('/admin/examRoom/trainId/:id', checkLogin);
    app.get('/admin/examRoom/trainId/:id', function(req, res) {
        ExamRoom.getFilter({ examId: req.params.id })
            .then(function(examRoom) {
                if (examRoom) {
                    return examRoom;
                } else {
                    return ExamClass.get(req.params.id)
                        .then(function(examClass) {
                            if (examClass) {
                                var examRoom = new ExamRoom({
                                    examId: examClass._id,
                                    examName: examClass.name
                                });
                                return examRoom.save();
                            }
                        });
                }
            })
            .then(function(examRoom) {
                if (examRoom) {
                    res.render('Server/examRoomDetail.html', {
                        title: '>考场管理',
                        user: req.session.user,
                        examRoom: examRoom
                    });
                }
            });
    });

    app.get('/admin/examRoom/:id', checkLogin);
    app.get('/admin/examRoom/:id', function(req, res) {
        ExamRoom.get(req.params.id)
            .then(function(examRoom) {
                if (examRoom) {
                    return examRoom;
                }
            })
            .then(function(examRoom) {
                if (examRoom) {
                    res.render('Server/examRoomDetail.html', {
                        title: '>考场管理',
                        user: req.session.user,
                        examRoom: examRoom
                    });
                }
            });
    });

    app.post('/admin/examRoom/assign', checkLogin);
    app.post('/admin/examRoom/assign', function(req, res) {
        var examRoom = new ExamRoom({
            classRooms: JSON.parse(req.body.classRooms)
        });

        examRoom.update(req.body.id, function(err, examRoom) {
            if (err) {
                examRoom = {};
            }
            ExamRoom.get(examRoom._id)
                .then(function(examRoom) {
                    getStudents(examRoom.examId)
                        .then(function(students) {
                            var sites = getSites(examRoom);
                            if (students > sites) {
                                res.jsonp({ error: "座位数少于报名人数，无法分配" });
                                return;
                            }

                            assignStudents(examRoom)
                                .then(function(result) {
                                    if (result) {
                                        res.jsonp({ sucess: true });
                                    }
                                });
                        });

                });
        });
    });

    function getSites(examRoom) {
        var sites = 0;
        examRoom.classRooms.forEach(function(classRoom) {
            sites += parseInt(classRoom.examCount);
        });
        return sites;
    };

    function getStudents(examId) {
        return ExamClass.get(examId)
            .then(function(examClass) {
                return examClass.enrollCount;
            });
    };

    function assignStudents(examRoom) {
        return AdminEnrollExam.getAllEnrolledWithoutPaging({ examId: examRoom.examId })
            .then(function(orders) {
                var i = 0;
                examRoom.classRooms.forEach(function(classRoom) {
                    if (i >= orders.length) {
                        return;
                    }

                    var count = parseInt(classRoom.examCount);
                    for (var x = 0; x < count; x++) {
                        if (i >= orders.length) {
                            return;
                        }
                        setSeatsToOrder(orders[i], classRoom, x + 1);
                        i++;
                    }
                });
                return true;
            });
    };

    function setSeatsToOrder(order, classRoom, siteNo) {
        var adminEnrollExam = new AdminEnrollExam({
            classRoomId: classRoom.classRoomId,
            classRoomName: classRoom.classRoomName,
            examNo: siteNo
        });

        adminEnrollExam.update(order._id, function(err, result) {
            if (err) {
                result = {};
            }
        });
    };
}