var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    RebateEnrollExam = model.rebateEnrollExam,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/rebateEnrollExam/search', checkLogin);
    app.post('/admin/rebateEnrollExam/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var sql1 = "select count(0) as total from rebateEnrollExams R join adminEnrollExams O \
        on O._id=R.examOrderId \
        where R.isDeleted=false ",
            sql2 = "select R._id, R.rebateWay, O.studentName, O.examName,  \
        R.rebatePrice, R.createdDate from rebateEnrollExams R join adminEnrollExams O \
        on O._id=R.examOrderId \
        where R.isDeleted=false ";
        if (req.body.studentName.trim()) {
            sql1 += " and O.studentName=:studentName ";
            sql2 += " and O.studentName=:studentName ";
        }
        if (req.body.className.trim()) {
            sql1 += " and O.examName=:trainName ";
            sql2 += " and O.examName=:trainName ";
        }
        model.db.sequelize.query(sql1, {
                replacements: {
                    studentName: req.body.studentName,
                    trainName: req.body.className,
                    yearId: req.body.yearId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(totalObj => {
                var page = req.query.p ? parseInt(req.query.p) : 1;
                sql2 += " order by createdDate desc LIMIT " + ((page - 1) * pageSize) + "," + pageSize + " ";
                model.db.sequelize.query(sql2, {
                        replacements: {
                            studentName: req.body.studentName,
                            trainName: req.body.className,
                            yearId: req.body.yearId
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(orders => {
                        var total = totalObj[0].total;
                        res.jsonp({
                            adminEnrollExams: orders,
                            total: total,
                            page: page,
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * pageSize + orders.length) == total
                        });
                    });
            });
    });

    app.post('/admin/rebateEnrollExam/changePayway', checkLogin);
    app.post('/admin/rebateEnrollExam/changePayway', function (req, res) {
        return RebateEnrollExam.update({
                rebateWay: req.body.payWay,
                updatedDate: new Date(),
                deletedBy: req.session.admin._id
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
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
}