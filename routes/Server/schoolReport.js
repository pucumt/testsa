var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    AdminEnrollTrain = model.adminEnrollTrain,
    SchoolArea = model.schoolArea,
    TrainClass = model.trainClass,
    Subject = model.subject,
    Year = model.year,
    YearAttributeRelation = model.yearAttributeRelation,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/schoolReportList', checkLogin);
    app.get('/admin/schoolReportList', auth.checkSecure([0, 3, 7]));
    app.get('/admin/schoolReportList', function (req, res) {
        res.render('Server/schoolReportList.html', {
            title: '>校区金额报表',
            user: req.session.admin
        });
    });

    app.get('/admin/payWayReportList', checkLogin);
    app.get('/admin/payWayReportList', function (req, res) {
        res.render('Server/payWayReportList.html', {
            title: '>支付方式报表',
            user: req.session.admin
        });
    });

    app.get('/admin/rebateReportList', checkLogin);
    app.get('/admin/rebateReportList', function (req, res) {
        res.render('Server/rebateReportList.html', {
            title: '>退费报表',
            user: req.session.admin
        });
    });

    app.get('/admin/rebateDetailList', checkLogin);
    app.get('/admin/rebateDetailList', function (req, res) {
        res.render('Server/rebateDetailList.html', {
            title: '>退费详情',
            user: req.session.admin
        });
    });

    app.get('/admin/changeSchoolList', checkLogin);
    app.get('/admin/changeSchoolList', function (req, res) {
        res.render('Server/changeSchoolList.html', {
            title: '>跨校区调班',
            user: req.session.admin
        });
    });

    app.get('/admin/peopleCountList', checkLogin);
    app.get('/admin/peopleCountList', function (req, res) {
        res.render('Server/peopleCountList.html', {
            title: '>人数统计',
            user: req.session.admin
        });
    });

    app.get('/admin/gradeMOneList', checkLogin);
    app.get('/admin/gradeMOneList', function (req, res) {
        res.render('Server/gradeMOneList.html', {
            title: '>小升初报名情况',
            user: req.session.admin
        });
    });

    app.get('/admin/compareLastList', checkLogin);
    app.get('/admin/compareLastList', function (req, res) {
        res.render('Server/compareLastList.html', {
            title: '>留存报表',
            user: req.session.admin
        });
    });

    app.get('/admin/compareGradeList', checkLogin);
    app.get('/admin/compareGradeList', function (req, res) {
        res.render('Server/compareGradeList.html', {
            title: '>年级留存报表',
            user: req.session.admin
        });
    });

    app.get('/admin/compareSchoolList', checkLogin);
    app.get('/admin/compareSchoolList', function (req, res) {
        res.render('Server/compareSchoolList.html', {
            title: '>校区留存报表',
            user: req.session.admin
        });
    });

    // 校区金额报表
    app.post('/admin/schoolReportList/search', checkLogin);
    app.post('/admin/schoolReportList/search', function (req, res) {
        var strSql = "select C.schoolId as _id, C.schoolArea as name, sum(O.totalPrice) as trainPrice, sum(O.realMaterialPrice) as materialPrice \
        from adminEnrollTrains O join trainClasss C \
        on O.trainId=C._id \
        where O.isDeleted=false and O.isPayed=true and (O.isSucceed=1 or O.isSucceed=7) ";
        if (req.body.attributeId) {
            strSql += " and C.attributeId=:attributeId ";
        }
        strSql += " and O.yearId=:yearId and O.createdDate between :startDate and :endDate \
        group by C.schoolId, C.schoolArea";

        model.db.sequelize.query(strSql, {
                replacements: {
                    yearId: global.currentYear._id,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    attributeId: req.body.attributeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(orders => {
                if (orders && orders.length > 0) {
                    orders.forEach(function (order) {
                        order.totalPrice = parseFloat(order.trainPrice) + parseFloat(order.materialPrice);
                    });
                }
                res.json(orders);
            });
    });

    app.post('/admin/payWayReportList/search', checkLogin);
    app.post('/admin/payWayReportList/search', function (req, res) {
        function getPayWay(way) {
            switch (way) {
                case 0:
                    return "现金";
                case 1:
                    return "刷卡";
                case 2:
                    return "转账";
                case 8:
                    return "支付宝扫码";
                case 9:
                    return "微信扫码";
                case 6:
                    return "在线支付";
                default:
                    return "No payWay";
            }
        }
        var strQuery = "select O.payWay, sum(O.totalPrice) as trainPrice, sum(O.realMaterialPrice) as materialPrice, sum(O.rebatePrice) as rebatePrice \
                            from adminEnrollTrains O join trainClasss C \
                            on O.trainId=C._id \
                            where O.isDeleted=false and O.isPayed=true and O.fromId='' \
                            and O.yearId=:yearId and O.createdDate between :startDate and :endDate ";
        if (req.body.schoolId) {
            strQuery = strQuery + " and C.schoolId=:schoolId ";
        }
        if (req.body.attributeId) {
            strQuery = strQuery + " and C.attributeId=:attributeId ";
        }
        strQuery = strQuery + " group by O.payWay ";
        model.db.sequelize.query(strQuery, {
                replacements: {
                    yearId: global.currentYear._id,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    schoolId: req.body.schoolId,
                    attributeId: req.body.attributeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(orders => {
                if (orders && orders.length > 0) {
                    orders.forEach(function (order) {
                        order.totalPrice = parseFloat(order.trainPrice) + parseFloat(order.materialPrice) + parseFloat(order.rebatePrice);
                        order.name = getPayWay(order.payWay);
                    });
                }
                res.json(orders);
            });
    });

    app.post('/admin/rebateReportList/search', checkLogin);
    app.post('/admin/rebateReportList/search', function (req, res) {
        var strSql = "select C.subjectId as _id, C.subjectName as name, sum(R.rebateTotalPrice) as rebatePrice\
            from rebateEnrollTrains R join adminEnrollTrains O on R.trainOrderId=O._id \
            join trainClasss C on O.trainId=C._id \
            where O.yearId=:yearId and R.createdDate between :startDate and :endDate and C.schoolId=:schoolId ";
        if (req.body.attributeId) {
            strSql += " and C.attributeId=:attributeId ";
        }
        strSql += "group by C.subjectId, C.subjectName";

        model.db.sequelize.query(strSql, {
                replacements: {
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    schoolId: req.body.schoolId,
                    attributeId: req.body.attributeId,
                    yearId: global.currentYear._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(orders => {
                res.json(orders);
            });
    });

    app.post('/admin/rebateDetailList/search', checkLogin);
    app.post('/admin/rebateDetailList/search', function (req, res) {
        var sql1 = "select count(0) as total ",
            sql2 = "select R._id, R.rebateWay, O.studentName, O.trainName, O.schoolArea,  \
        R.rebateTotalPrice, R.createdDate ",
            sqlMiddle = "from rebateEnrollTrains R join adminEnrollTrains O \
            on O._id=R.trainOrderId join trainClasss C on O.trainId=C._id \
            where R.isDeleted=false and O.yearId=:yearId and R.createdDate between :startDate and :endDate and C.schoolId=:schoolId";
        if (req.body.attributeId) {
            sqlMiddle += " and C.attributeId=:attributeId ";
        }
        model.db.sequelize.query(sql1 + sqlMiddle, {
                replacements: {
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    schoolId: req.body.schoolId,
                    attributeId: req.body.attributeId,
                    yearId: global.currentYear._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(totalObj => {
                var page = req.query.p ? parseInt(req.query.p) : 1;
                sqlMiddle += " order by R.createdDate desc LIMIT " + ((page - 1) * pageSize) + "," + pageSize + " ";
                model.db.sequelize.query(sql2 + sqlMiddle, {
                        replacements: {
                            startDate: req.body.startDate,
                            endDate: req.body.endDate,
                            schoolId: req.body.schoolId,
                            attributeId: req.body.attributeId,
                            yearId: global.currentYear._id
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(orders => {
                        var total = totalObj[0].total;
                        res.jsonp({
                            adminEnrollTrains: orders,
                            total: total,
                            page: page,
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * pageSize + orders.length) == total
                        });
                    });
            });
    });


    app.post('/admin/changeSchoolList/search', checkLogin);
    app.post('/admin/changeSchoolList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            cancelType: 2
        };

        AdminEnrollTrain.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                adminEnrollTrains: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });

    app.post('/admin/peopleCountList/search', checkLogin);
    app.post('/admin/peopleCountList/search', function (req, res) {
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
        if (req.body.attributeId) {
            filter.attributeId = req.body.attributeId;
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

    // 留存报表
    app.post('/admin/compareLastList/search', checkLogin);
    app.post('/admin/compareLastList/search', function (req, res) {
        // 1. current Year with attribute
        // 2. last Year with attribute
        // 3. 不能 2 季度都有attribute
        model.db.sequelize.query("select A._id, A.name from yearAttributeRelations R left join classAttributes A on R.attributeId=A._id and A.isDeleted=false \
            where R.yearId=:yearId and R.isDeleted=false and A.name='春季班' ", {
                replacements: {
                    yearId: global.currentYear._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(currentYearRelations => {
                model.db.sequelize.query("select Y._id, R.attributeId, DATE_SUB(Y.calculateDate,INTERVAL 8 HOUR) as calculateDate from years Y left join yearAttributeRelations R on Y._id=R.yearId and R.isDeleted=false\
                 left join classAttributes A on R.attributeId=A._id and A.name='春季班' and A.isDeleted=false \
                    where Y.sequence=:sequence and Y.isDeleted=false ", {
                        replacements: {
                            sequence: (global.currentYear.sequence - 1)
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (lastYearArray) {
                        if (lastYearArray && lastYearArray.length > 0) {
                            var lastYear = lastYearArray[0],
                                list = [],
                                filter = {
                                    schoolId: req.body.schoolId,
                                    yearId: lastYear._id,
                                    createdDate: {
                                        $lt: lastYear.calculateDate
                                    }
                                };

                            if (req.body.gradeId) {
                                filter.gradeId = req.body.gradeId;
                            }

                            if (req.body.subjectId) {
                                filter.subjectId = req.body.subjectId;
                            }

                            if (req.body.name) {
                                filter.name = {
                                    $like: `%${req.body.name.trim()}%`
                                };
                            }
                            var attributeId;
                            if (currentYearRelations && currentYearRelations.length > 0) {
                                // only check 春季班
                                // get attributeId
                                attributeId = currentYearRelations[0]._id;
                            } else if (lastYear.attributeId) {
                                filter.attributeId = lastYear.attributeId;
                            }
                            TrainClass.getFilters(filter)
                                .then(function (trainClasses) {
                                    var pArray = [];
                                    if (trainClasses && trainClasses.length > 0) {
                                        trainClasses.forEach(function (trainClass) {
                                            var p = AdminEnrollTrain.getFilters({
                                                    createdDate: {
                                                        $lt: lastYear.calculateDate
                                                    },
                                                    trainId: trainClass._id,
                                                    $or: [{
                                                            isSucceed: 1
                                                        },
                                                        {
                                                            deletedDate: {
                                                                $gt: lastYear.calculateDate
                                                            }
                                                        }
                                                    ]
                                                })
                                                .then(function (orders) {
                                                    if (orders && orders.length > 0) {
                                                        var studentIds = orders.map(function (order) {
                                                            return order.studentId;
                                                        });
                                                        var strSql = "select count(0) as count \
                                                        from adminEnrollTrains O join trainClasss C on O.trainId=C._id and C.isDeleted=false \
                                                        where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId and O.studentId in (:studentIds) and C.subjectId=:subjectId ";
                                                        if (attributeId) {
                                                            strSql += " and C.attributeId=:attributeId ";
                                                        }
                                                        return model.db.sequelize.query(strSql, {
                                                                replacements: {
                                                                    yearId: global.currentYear._id,
                                                                    subjectId: trainClass.subjectId,
                                                                    studentIds: studentIds,
                                                                    attributeId: attributeId
                                                                },
                                                                type: model.db.sequelize.QueryTypes.SELECT
                                                            })
                                                            .then(function (result) {
                                                                var count = (result && result[0] && result[0].count) || 0;
                                                                list.push({
                                                                    _id: trainClass._id,
                                                                    name: trainClass.name,
                                                                    gradeName: trainClass.gradeName,
                                                                    teacherName: trainClass.teacherName,
                                                                    originalCount: orders.length,
                                                                    enrollCount: count,
                                                                    enrollRatio: (orders.length > 0 ? (count * 100 / orders.length).toFixed(2) : 0)
                                                                });
                                                            });
                                                    } else {
                                                        list.push({
                                                            _id: trainClass._id,
                                                            name: trainClass.name,
                                                            teacherName: "没找到学生",
                                                            originalCount: 0,
                                                            enrollCount: 0,
                                                            enrollRatio: 0
                                                        });
                                                    }

                                                });
                                            pArray.push(p);
                                        });
                                    }
                                    Promise.all(pArray).then(function () {
                                        res.json(list);
                                    });
                                });

                        } else {
                            res.json({
                                error: "没有上一年度"
                            });
                        }
                    });
            });
    });

    app.post('/admin/compareGradeList/search', checkLogin);
    app.post('/admin/compareGradeList/search', function (req, res) {
        // 1. current Year with attribute
        // 2. last Year with attribute
        // 3. 不能 2 季度都有attribute
        model.db.sequelize.query("select A._id, A.name from yearAttributeRelations R left join classAttributes A on R.attributeId=A._id and A.isDeleted=false \
            where R.yearId=:yearId and R.isDeleted=false and A.name='春季班' ", {
                replacements: {
                    yearId: global.currentYear._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(currentYearRelations => {
                model.db.sequelize.query("select Y._id, R.attributeId, DATE_SUB(Y.calculateDate,INTERVAL 8 HOUR) as calculateDate from years Y left join yearAttributeRelations R on Y._id=R.yearId and R.isDeleted=false\
                 left join classAttributes A on R.attributeId=A._id and A.name='春季班' and A.isDeleted=false \
                    where Y.sequence=:sequence and Y.isDeleted=false ", {
                        replacements: {
                            sequence: (global.currentYear.sequence - 1)
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (lastYearArray) {
                        if (lastYearArray && lastYearArray.length > 0) {
                            var lastYear = lastYearArray[0],
                                list = [],
                                curAttributeId, lastAttributeId;
                            if (currentYearRelations && currentYearRelations.length > 0) {
                                // only check 春季班
                                // get attributeId
                                curAttributeId = currentYearRelations[0]._id;
                            } else if (lastYear.attributeId) {
                                lastAttributeId = lastYear.attributeId;
                            }

                            var strSql = "";
                            model.db.sequelize.query("call getGradeCompare(:lastYear,:lastAttributeId, :curYear,:curAttributeId);", {
                                    replacements: {
                                        lastYear: lastYear._id,
                                        lastAttributeId: (lastAttributeId || null),
                                        curYear: global.currentYear._id,
                                        curAttributeId: (curAttributeId || null)
                                    },
                                    type: model.db.sequelize.QueryTypes.SELECT
                                })
                                .then(function (reports) {
                                    res.json(reports[0]);
                                });
                        } else {
                            res.json({
                                error: "没有上一年度"
                            });
                        }
                    });
            });
    });

    app.post('/admin/compareSchoolList/search', checkLogin);
    app.post('/admin/compareSchoolList/search', function (req, res) {
        // 1. current Year with attribute
        // 2. last Year with attribute
        // 3. 不能 2 季度都有attribute
        model.db.sequelize.query("select A._id, A.name from yearAttributeRelations R left join classAttributes A on R.attributeId=A._id and A.isDeleted=false \
            where R.yearId=:yearId and R.isDeleted=false and A.name='春季班' ", {
                replacements: {
                    yearId: global.currentYear._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(currentYearRelations => {
                model.db.sequelize.query("select Y._id, R.attributeId, DATE_SUB(Y.calculateDate,INTERVAL 8 HOUR) as calculateDate from years Y left join yearAttributeRelations R on Y._id=R.yearId and R.isDeleted=false\
                 left join classAttributes A on R.attributeId=A._id and A.name='春季班' and A.isDeleted=false \
                    where Y.sequence=:sequence and Y.isDeleted=false ", {
                        replacements: {
                            sequence: (global.currentYear.sequence - 1)
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(function (lastYearArray) {
                        if (lastYearArray && lastYearArray.length > 0) {
                            var lastYear = lastYearArray[0],
                                list = [],
                                filter = {
                                    schoolId: req.body.schoolId,
                                    yearId: lastYear._id,
                                    createdDate: {
                                        $lt: lastYear.calculateDate
                                    }
                                };

                            if (req.body.gradeId) {
                                filter.gradeId = req.body.gradeId;
                            }

                            if (req.body.subjectId) {
                                filter.subjectId = req.body.subjectId;
                            }

                            if (req.body.name) {
                                filter.name = {
                                    $like: `%${req.body.name.trim()}%`
                                };
                            }
                            var attributeId;
                            if (currentYearRelations && currentYearRelations.length > 0) {
                                // only check 春季班
                                // get attributeId
                                attributeId = currentYearRelations[0]._id;
                            } else if (lastYear.attributeId) {
                                filter.attributeId = lastYear.attributeId;
                            }
                            TrainClass.getFilters(filter)
                                .then(function (trainClasses) {
                                    var pArray = [];
                                    if (trainClasses && trainClasses.length > 0) {
                                        trainClasses.forEach(function (trainClass) {
                                            var p = AdminEnrollTrain.getFilters({
                                                    createdDate: {
                                                        $lt: lastYear.calculateDate
                                                    },
                                                    trainId: trainClass._id,
                                                    $or: [{
                                                            isSucceed: 1
                                                        },
                                                        {
                                                            deletedDate: {
                                                                $gt: lastYear.calculateDate
                                                            }
                                                        }
                                                    ]
                                                })
                                                .then(function (orders) {
                                                    if (orders && orders.length > 0) {
                                                        var studentIds = orders.map(function (order) {
                                                            return order.studentId;
                                                        });
                                                        var strSql = "select count(0) as count \
                                                        from adminEnrollTrains O join trainClasss C on O.trainId=C._id and C.isDeleted=false \
                                                        where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId and O.studentId in (:studentIds) and C.subjectId=:subjectId ";
                                                        if (attributeId) {
                                                            strSql += " and C.attributeId=:attributeId ";
                                                        }
                                                        return model.db.sequelize.query(strSql, {
                                                                replacements: {
                                                                    yearId: global.currentYear._id,
                                                                    subjectId: trainClass.subjectId,
                                                                    studentIds: studentIds,
                                                                    attributeId: attributeId
                                                                },
                                                                type: model.db.sequelize.QueryTypes.SELECT
                                                            })
                                                            .then(function (result) {
                                                                var count = (result && result[0] && result[0].count) || 0;
                                                                list.push({
                                                                    _id: trainClass._id,
                                                                    name: trainClass.name,
                                                                    gradeName: trainClass.gradeName,
                                                                    teacherName: trainClass.teacherName,
                                                                    originalCount: orders.length,
                                                                    enrollCount: count,
                                                                    enrollRatio: (orders.length > 0 ? (count * 100 / orders.length).toFixed(2) : 0)
                                                                });
                                                            });
                                                    } else {
                                                        list.push({
                                                            _id: trainClass._id,
                                                            name: trainClass.name,
                                                            teacherName: "没找到学生",
                                                            originalCount: 0,
                                                            enrollCount: 0,
                                                            enrollRatio: 0
                                                        });
                                                    }

                                                });
                                            pArray.push(p);
                                        });
                                    }
                                    Promise.all(pArray).then(function () {
                                        res.json(list);
                                    });
                                });

                        } else {
                            res.json({
                                error: "没有上一年度"
                            });
                        }
                    });
            });
    });

    app.get('/admin/enrollAggregateList', checkLogin);
    app.get('/admin/enrollAggregateList', function (req, res) {
        res.render('Server/enrollAggregateList.html', {
            title: '>报名情况统计',
            user: req.session.admin
        });
    });

    app.get('/admin/otherReportList', checkLogin);
    app.get('/admin/otherReportList', function (req, res) {
        res.render('Server/otherReportList.html', {
            title: '>其他报表情况',
            user: req.session.admin
        });
    });

    // 连报统计
    app.post('/admin/enrollAggregateList/search', checkLogin);
    app.post('/admin/enrollAggregateList/search', function (req, res) {
        var countObject = {};
        var strQuery = "select count(0) as count from adminEnrollTrains O join trainClasss C on O.trainId=C._id and C.isDeleted=false \
            where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId ";
        if (req.body.gradeId) {
            strQuery = strQuery + " and C.gradeId=:gradeId ";
        }
        if (req.body.attributeId) {
            strQuery = strQuery + " and C.attributeId=:attributeId ";
        }
        var p0 = model.db.sequelize.query(strQuery, {
                replacements: {
                    yearId: global.currentYear._id,
                    gradeId: req.body.gradeId,
                    attributeId: req.body.attributeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (result) {
                countObject.totalCount = (result && result[0] && result[0].count) || 0; // 总订单
            });

        strQuery = "select count(0) as count from \
            (select 1 from adminEnrollTrains O join trainClasss C on O.trainId=C._id and C.isDeleted=false \
            where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId ";
        if (req.body.gradeId) {
            strQuery = strQuery + " and C.gradeId=:gradeId ";
        }
        if (req.body.attributeId) {
            strQuery = strQuery + " and C.attributeId=:attributeId ";
        }
        strQuery = strQuery + " group by O.studentId) R ";
        var p1 = model.db.sequelize.query(strQuery, {
                replacements: {
                    yearId: global.currentYear._id,
                    gradeId: req.body.gradeId,
                    attributeId: req.body.attributeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (result) {
                countObject.peopleCount = (result && result[0] && result[0].count) || 0; // 下单总人数
            });

        strQuery = "select count(0) as count from \
            (select count(0) as countChild from adminEnrollTrains O join trainClasss C on O.trainId=C._id and C.isDeleted=false \
            where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId ";
        if (req.body.gradeId) {
            strQuery = strQuery + " and C.gradeId=:gradeId ";
        }
        if (req.body.attributeId) {
            strQuery = strQuery + " and C.attributeId=:attributeId ";
        }
        strQuery = strQuery + " group by O.studentId) R where R.countChild=2";
        var p2 = model.db.sequelize.query(strQuery, {
                replacements: {
                    yearId: global.currentYear._id,
                    gradeId: req.body.gradeId,
                    attributeId: req.body.attributeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (result) {
                countObject.twoOrderCount = (result && result[0] && result[0].count) || 0; // 连报2门
            });

        strQuery = "select count(0) as count from \
            (select count(0) as countChild from adminEnrollTrains O join trainClasss C on O.trainId=C._id and C.isDeleted=false \
            where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId ";
        if (req.body.gradeId) {
            strQuery = strQuery + " and C.gradeId=:gradeId";
        }
        if (req.body.attributeId) {
            strQuery = strQuery + " and C.attributeId=:attributeId ";
        }
        strQuery = strQuery + " group by O.studentId) R where R.countChild=3";
        var p3 = model.db.sequelize.query(strQuery, {
                replacements: {
                    yearId: global.currentYear._id,
                    gradeId: req.body.gradeId,
                    attributeId: req.body.attributeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (result) {
                countObject.threeOrderCount = (result && result[0] && result[0].count) || 0; // 连报3门
            });

        strQuery = "select count(0) as count from \
            (select count(0) as countChild from adminEnrollTrains O join trainClasss C on O.trainId=C._id and C.isDeleted=false \
            where O.isDeleted=false and O.isSucceed=1 and O.yearId=:yearId ";
        if (req.body.gradeId) {
            strQuery = strQuery + " and C.gradeId=:gradeId";
        }
        if (req.body.attributeId) {
            strQuery = strQuery + " and C.attributeId=:attributeId ";
        }
        strQuery = strQuery + " group by O.studentId) R where R.countChild>3";
        var p4 = model.db.sequelize.query(strQuery, {
                replacements: {
                    yearId: global.currentYear._id,
                    gradeId: req.body.gradeId,
                    attributeId: req.body.attributeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (result) {
                countObject.fourOrMoreCount = (result && result[0] && result[0].count) || 0; // 连报4门及以上
            });

        Promise.all([p0, p1, p2, p3, p4])
            .then(function () {
                var list = [];
                list.push({
                    name: "总订单",
                    value: countObject.totalCount || 0
                });
                list.push({
                    name: "下单总人数",
                    value: countObject.peopleCount || 0
                });
                list.push({
                    name: "连报2门",
                    value: countObject.twoOrderCount || 0
                });
                list.push({
                    name: "连报3门",
                    value: countObject.threeOrderCount || 0
                });
                list.push({
                    name: "连报4门及以上",
                    value: countObject.fourOrMoreCount || 0
                });

                res.json(list);
            });
    });
}