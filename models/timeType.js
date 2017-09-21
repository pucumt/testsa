var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var timeTypeSchema = new mongoose.Schema({
    name: String,
    isChecked: {
        type: Boolean,
        default: true
    }, //是否使用
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'timeTypes'
});

var timeTypeModel = mongoose.model('timeType', timeTypeSchema);

function TimeType(option) {
    this.option = option;
};

module.exports = TimeType;

//存储学区信息
TimeType.prototype.save = function (callback) {
    var newtimeType = new timeTypeModel(this.option);

    newtimeType.save(function (err, timeType) {
        if (err) {
            return callback(err);
        }
        callback(null, timeType);

        //db.close();
    });
};

TimeType.prototype.update = function (id, callback) {
    timeTypeModel.update({
        _id: id
    }, this.option).exec(function (err, timeType) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
TimeType.get = function (id, callback) {
    //打开数据库
    timeTypeModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    }, function (err, timeType) {
        if (err) {
            return callback(err);
        }
        callback(null, timeType);

        //db.close();
    });
};

//一次获取20个学区信息
TimeType.getAll = function (id, page, filter, callback) {
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
    var query = timeTypeModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, timeTypes) {
                callback(null, timeTypes, count);
            });
    });
};

//删除一个学区
TimeType.delete = function (id, callback) {
    timeTypeModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, timeType) {
        if (err) {
            return callback(err);
        }
        callback(null, timeType);
    });
};


TimeType.updateBatch = function (filter, updated) {
    return timeTypeModel.update(filter, updated, {
            multi: true
        })
        .exec();
};

TimeType.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return timeTypeModel.find(filter);
};

TimeType.rawAll = function () {
    return timeTypeModel.find();
};