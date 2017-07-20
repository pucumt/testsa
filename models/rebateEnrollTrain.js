var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var rebateEnrollTrainSchema = new mongoose.Schema({
    trainOrderId: ObjectId,
    originalPrice: Number, //原来价格
    originalMaterialPrice: Number, //原来教材费价格
    rebateTotalPrice: Number, //总退费
    rebatePrice: Number, //培训费退费
    rebateMaterialPrice: Number, //教材费退费
    isDeleted: Boolean,
    createDate: Date,
    comment: String,
    rebateWay: { type: Number, default: 0 } //6在线 null/0 现金
}, {
    collection: 'rebateEnrollTrains'
});

var rebateEnrollTrainModel = mongoose.model('rebateEnrollTrain', rebateEnrollTrainSchema);

function RebateEnrollTrain(option) {
    this.option = option;
};

module.exports = RebateEnrollTrain;

//存储学区信息
RebateEnrollTrain.prototype.save = function() {
    this.option.createDate = new Date();
    var newrebateEnrollTrain = new rebateEnrollTrainModel(this.option);
    return newrebateEnrollTrain.save();
};

RebateEnrollTrain.prototype.update = function(id, callback) {
    rebateEnrollTrainModel.update({
        _id: id
    }, this.option).exec(function(err, rebateEnrollTrain) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
RebateEnrollTrain.get = function(id, callback) {
    //打开数据库
    rebateEnrollTrainModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, rebateEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, rebateEnrollTrain);

        //db.close();
    });
};

//一次获取20个学区信息
RebateEnrollTrain.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = rebateEnrollTrainModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, rebateEnrollTrains) {
                callback(null, rebateEnrollTrains, count);
            });
    });
};

//删除一个学区
RebateEnrollTrain.delete = function(id, callback) {
    rebateEnrollTrainModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, rebateEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, rebateEnrollTrain);
    });
};

RebateEnrollTrain.getFilters = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return rebateEnrollTrainModel.find(filter)
        .exec();
};

RebateEnrollTrain.changeTrainId = function(order) {
    return rebateEnrollTrainModel.update({
        _id: order._id
    }, {
        trainOrderId: order.trainOrderId
    }).exec();
};

RebateEnrollTrain.getRebateReportList = function(yearId, startDate, endDate, schoolId) {
    ///TBD
    return rebateEnrollTrainModel.aggregate({
            $match: {
                isDeleted: { $ne: true },
                createDate: { $gte: (new Date(startDate)), $lte: (new Date(endDate)) }
            }
        })
        .lookup({
            from: "adminEnrollTrains",
            localField: "trainOrderId",
            foreignField: "_id",
            as: "orders"
        })
        .lookup({
            from: "trainClasss",
            localField: "orders.trainId",
            foreignField: "_id",
            as: "trainClasss"
        });

    if (schoolId) {
        aggQuery = aggQuery.match({
            "trainClasss.schoolId": schoolId
        });
    }
    return aggQuery.group({
            _id: "$payWay",
            trainPrice: { $sum: "$totalPrice" },
            materialPrice: { $sum: "$realMaterialPrice" }
        })
        .exec();
};