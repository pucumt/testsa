var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var adminEnrollTrainSchema = new mongoose.Schema({
    name: String,
    address: String,
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
AdminEnrollTrain.prototype.save = function(callback) {
    var newadminEnrollTrain = new adminEnrollTrainModel(this.option);

    newadminEnrollTrain.save(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);

        //db.close();
    });
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
    adminEnrollTrainModel.findOne({ _id: id, isDeleted: { $ne: true }}, function(err, adminEnrollTrain) {
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