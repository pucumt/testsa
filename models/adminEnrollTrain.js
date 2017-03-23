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
    totalPrice: Number,
    isSucceed: Number, //1 succeed, 9 canceled 
    isPayed: Boolean,
    payWay: Number, //0 cash 1 offline card 8 online zhifubao 9 online weixin
    isDeleted: Boolean
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
AdminEnrollTrain.get = function(id, callback) {
    //打开数据库
    adminEnrollTrainModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);

        //db.close();
    });
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
    return adminEnrollTrainModel.findOne({ studentId: studentId, trainId: trainId, isDeleted: { $ne: true } });
};

AdminEnrollTrain.cancel = function(id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9
    }).exec(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};