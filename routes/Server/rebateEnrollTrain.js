var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    RebateEnrollTrain = model.rebateEnrollTrain,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/rebateEnrollTrain/search', checkLogin);
    app.post('/admin/rebateEnrollTrain/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var sql1 = "select count(0) as total from rebateEnrollTrains R join adminEnrollTrains O \
        on O._id=R.trainOrderId \
        where R.isDeleted=false ",
            sql2 = "select R._id, R.rebateWay, O.mobile, O.trainName,  \
        R.rebateTotalPrice, R.createdDate from rebateEnrollTrains R join adminEnrollTrains O \
        on O._id=R.trainOrderId \
        where R.isDeleted=false ";
        if (req.body.studentName.trim()) {
            sql1 += " and O.mobile=:mobile ";
            sql2 += " and O.mobile=:mobile ";
        }
        if (req.body.className.trim()) {
            sql1 += " and O.trainName=:trainName ";
            sql2 += " and O.trainName=:trainName ";
        }
        model.db.sequelize.query(sql1, {
                replacements: {
                    mobile: req.body.studentName,
                    trainName: req.body.className
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
                            adminEnrollTrains: orders,
                            total: total,
                            page: page,
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * pageSize + orders.length) == total
                        });
                    });
            });
    });

    app.post('/admin/rebateEnrollTrain/changePayway', checkLogin);
    app.post('/admin/rebateEnrollTrain/changePayway', function (req, res) {
        return RebateEnrollTrain.update({
                rebateWay: req.body.payWay
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