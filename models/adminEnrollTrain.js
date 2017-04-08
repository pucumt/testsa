var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var adminEnrollTrainSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    mobile: String,
    trainId: String,
    trainName: String,
    trainPrice: Number,
    materialPrice: Number,
    discount: Number,
    totalPrice: Number, //实际培训费
    realMaterialPrice: Number, //实际教材费
    rebatePrice: Number, //退费
    isSucceed: Number, //1 succeed, 9 canceled
    isPayed: Boolean,
    payWay: Number, //0 cash 1 offline card 2 zhuanzhang 8 online zhifubao 9 online weixin
    isDeleted: Boolean,
    orderDate: Date,
    cancelDate: Date,
    comment: String,
    fromId: String
}, {
    collection: 'adminEnrollTrains'
});

var adminEnrollTrainModel = mongoose.model('adminEnrollTrain', adminEnrollTrainSchema);

function AdminEnrollTrain(option) {
    this.option = option;
};

module.exports = AdminEnrollTrain;

//存储学区信息
AdminEnrollTrain.prototype.save = function() {
    this.option.orderDate = new Date();
    this.option.rebatePrice = 0;
    this.option.isSucceed = 1;
    var newadminEnrollTrain = new adminEnrollTrainModel(this.option);
    return newadminEnrollTrain.save();
};

AdminEnrollTrain.prototype.update = function(id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, this.option).exec(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
AdminEnrollTrain.get = function(id) {
    //打开数据库
    return adminEnrollTrainModel.findOne({ _id: id });
};

//一次获取20个学区信息
AdminEnrollTrain.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = adminEnrollTrainModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, adminEnrollTrains) {
                callback(null, adminEnrollTrains, count);
            });
    });
};

AdminEnrollTrain.getAllOfStudent = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = adminEnrollTrainModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .select({ studentId: 1, studentName: 1 })
            .exec(function(err, adminEnrollTrains) {
                callback(null, adminEnrollTrains, count);
            });
    });
};

//删除一个学区
AdminEnrollTrain.delete = function(id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};

AdminEnrollTrain.getByStudentAndClass = function(studentId, trainId) {
    //打开数据库
    return adminEnrollTrainModel.findOne({ studentId: studentId, trainId: trainId, isSucceed: 1, isDeleted: { $ne: true } });
};

AdminEnrollTrain.cancel = function(id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9,
        cancelDate: new Date()
    }).exec(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};

AdminEnrollTrain.rebate = function(id, price) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        $inc: { rebatePrice: price }
    }).exec();
};

AdminEnrollTrain.changeClass = function(id) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9,
        cancelDate: new Date()
    }).exec();
};

AdminEnrollTrain.pay = function(id, payWay) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        isPayed: true,
        payWay: payWay
    }).exec();
};

AdminEnrollTrain.getFilters = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return adminEnrollTrainModel.find(filter)
        .exec();
};