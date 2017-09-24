var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var rollCallConfigureSchema = new mongoose.Schema({
    yearId: String,
    yearName: String,
    sequence: Number,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'rollCallConfigures'
});

var rollCallConfigureModel = mongoose.model('rollCallConfigure', rollCallConfigureSchema);

function RollCallConfigure(option) {
    this.option = option;
};

module.exports = RollCallConfigure;

//存储学区信息
RollCallConfigure.prototype.save = function () {
    var newrollCallConfigure = new rollCallConfigureModel(this.option);

    return newrollCallConfigure.save();
};

RollCallConfigure.prototype.update = function (id, callback) {
    rollCallConfigureModel.update({
        _id: id
    }, this.option).exec(function (err, rollCallConfigure) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
RollCallConfigure.get = function () {
    //打开数据库
    return rollCallConfigureModel.findOne({
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
RollCallConfigure.getAll = function (id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = {
            $ne: true
        };
    } else {
        filter = {
            isDeleted: {
                $ne: true
            }
        };
    }
    var query = rollCallConfigureModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, rollCallConfigures) {
                callback(null, rollCallConfigures, count);
            });
    });
};

//删除一个学区
RollCallConfigure.delete = function (id) {
    return rollCallConfigureModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};

RollCallConfigure.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return rollCallConfigureModel.findOne(filter);
};

RollCallConfigure.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return rollCallConfigureModel.find(filter);
};

RollCallConfigure.batchUpdate = function (filter, option) {
    //打开数据库
    return rollCallConfigureModel.update(filter, option, {
        multi: true
    }).exec();
};

RollCallConfigure.rawAll = function () {
    return rollCallConfigureModel.find();
};