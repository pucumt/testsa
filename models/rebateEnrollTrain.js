var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var rebateEnrollTrainSchema = new mongoose.Schema({
    trainOrderId: String,
    rebatePrice: Number, //退费
    isDeleted: Boolean,
    createDate: Date
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