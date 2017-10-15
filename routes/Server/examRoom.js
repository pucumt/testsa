// no need anymore
var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ExamRoom = model.examRoom,
    ExamClass = model.examClass,
    AdminEnrollExam = model.adminEnrollExam,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/examRoomList', checkLogin);
    app.get('/admin/examRoomList', function (req, res) {
        res.render('Server/examRoomList.html', {
            title: '>考场列表',
            user: req.session.admin
        });
    });

    app.post('/admin/examRoom/add', checkLogin);
    app.post('/admin/examRoom/add', function (req, res) {
        ExamRoom.create({
                name: req.body.name,
                address: req.body.address
            })
            .then(function (examRoom) {
                res.jsonp(examRoom);
            });
    });

    app.post('/admin/examRoom/edit', checkLogin);
    app.post('/admin/examRoom/edit', function (req, res) {
        ExamRoom.update({
                classRooms: JSON.parse(req.body.classRooms)
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (examRoom) {
                res.jsonp(examRoom);
            });
    });

    app.post('/admin/examRoom/delete', checkLogin);
    app.post('/admin/examRoom/delete', function (req, res) {
        ExamRoom.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
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

    app.post('/admin/examRoomList/search', checkLogin);
    app.post('/admin/examRoomList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        ExamRoom.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                examRooms: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.get('/admin/examRoom/trainId/:id', checkLogin);
    app.get('/admin/examRoom/trainId/:id', function (req, res) {
        ExamRoom.getFilter({
                examId: req.params.id
            })
            .then(function (examRoom) {
                if (examRoom) {
                    return examRoom;
                } else {
                    return ExamClass.getFilter({
                            _id: req.params.id
                        })
                        .then(function (examClass) {
                            if (examClass) {
                                return ExamRoom.create({
                                    examId: examClass._id,
                                    examName: examClass.name
                                });
                            }
                        });
                }
            })
            .then(function (examRoom) {
                if (examRoom) {
                    res.render('Server/examRoomDetail.html', {
                        title: '>考场管理',
                        user: req.session.admin,
                        examRoom: examRoom
                    });
                }
            });
    });

    app.get('/admin/examRoom/:id', checkLogin);
    app.get('/admin/examRoom/:id', function (req, res) {
        ExamRoom.getFilter({
                _id: req.params.id
            })
            .then(function (examRoom) {
                if (examRoom) {
                    return examRoom;
                }
            })
            .then(function (examRoom) {
                if (examRoom) {
                    res.render('Server/examRoomDetail.html', {
                        title: '>考场管理',
                        user: req.session.admin,
                        examRoom: examRoom
                    });
                }
            });
    });

    // 考场分配功能好像不需要
    app.post('/admin/examRoom/assign', checkLogin);
    app.post('/admin/examRoom/assign', function (req, res) {
        // var examRoom = new ExamRoom({
        //     classRooms: JSON.parse(req.body.classRooms)
        // });
        // examRoom.update(req.body.id, function (err, examRoom) {
        //     if (err) {
        //         examRoom = {};
        //     }
        //     ExamRoom.get(examRoom._id)
        //         .then(function (examRoom) {
        //             getStudents(examRoom.examId)
        //                 .then(function (students) {
        //                     var sites = getSites(examRoom);
        //                     if (students > sites) {
        //                         res.jsonp({
        //                             error: "座位数少于报名人数，无法分配"
        //                         });
        //                         return;
        //                     }

        //                     assignStudents(examRoom)
        //                         .then(function (result) {
        //                             if (result) {
        //                                 res.jsonp({
        //                                     sucess: true
        //                                 });
        //                             }
        //                         });
        //                 });

        //         });
        // });
    });

    // function getSites(examRoom) {
    //     var sites = 0;
    //     examRoom.classRooms.forEach(function (classRoom) {
    //         sites += parseInt(classRoom.examCount);
    //     });
    //     return sites;
    // };

    // function getStudents(examId) {
    //     return ExamClass.getFilter({
    //             _id: examId
    //         })
    //         .then(function (examClass) {
    //             return examClass.enrollCount;
    //         });
    // };

    // function assignStudents(examRoom) {
    //     return AdminEnrollExam.getAllEnrolledWithoutPaging({
    //             examId: examRoom.examId
    //         })
    //         .then(function (orders) {
    //             var i = 0;
    //             examRoom.classRooms.forEach(function (classRoom) {
    //                 if (i >= orders.length) {
    //                     return;
    //                 }

    //                 var count = parseInt(classRoom.examCount);
    //                 for (var x = 0; x < count; x++) {
    //                     if (i >= orders.length) {
    //                         return;
    //                     }
    //                     setSeatsToOrder(orders[i], classRoom, x + 1);
    //                     i++;
    //                 }
    //             });
    //             return true;
    //         });
    // };

    // function setSeatsToOrder(order, classRoom, siteNo) {
    //     var adminEnrollExam = new AdminEnrollExam({
    //         classRoomId: classRoom.classRoomId,
    //         classRoomName: classRoom.classRoomName,
    //         examNo: siteNo
    //     });

    //     adminEnrollExam.update(order._id, function (err, result) {
    //         if (err) {
    //             result = {};
    //         }
    //     });
    // };
}