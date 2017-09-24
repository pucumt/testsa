var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var enrollProcessConfigureSchema = new mongoose.Schema({
    newStudentStatus: {
        type: Boolean,
        default: false
    }, //新生报名接口状态
    oldStudentStatus: {
        type: Boolean,
        default: false
    }, //老生报名接口状态
    oldStudentSwitch: {
        type: Boolean,
        default: false
    }, //老生调班接口状态
    isGradeUpgrade: {
        type: Boolean,
        default: false
    }, //老生年级是否调整
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'enrollProcessConfigures'
});

var enrollProcessConfigureModel = mongoose.model('enrollProcessConfigure', enrollProcessConfigureSchema);

function EnrollProcessConfigure(option) {
    this.option = option;
};

module.exports = EnrollProcessConfigure;

//存储学区信息
EnrollProcessConfigure.prototype.save = function () {
    var newenrollProcessConfigure = new enrollProcessConfigureModel(this.option);

    return newenrollProcessConfigure.save();
};

EnrollProcessConfigure.prototype.update = function (id, callback) {
    enrollProcessConfigureModel.update({
        _id: id
    }, this.option).exec(function (err, enrollProcessConfigure) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
EnrollProcessConfigure.get = function () {
    //打开数据库
    return enrollProcessConfigureModel.findOne({
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
EnrollProcessConfigure.getAll = function (id, page, filter, callback) {
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
    var query = enrollProcessConfigureModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, enrollProcessConfigures) {
                callback(null, enrollProcessConfigures, count);
            });
    });
};

//删除一个学区
EnrollProcessConfigure.delete = function (id) {
    return enrollProcessConfigureModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};

EnrollProcessConfigure.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return enrollProcessConfigureModel.findOne(filter);
};

EnrollProcessConfigure.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return enrollProcessConfigureModel.find(filter);
};

EnrollProcessConfigure.batchUpdate = function (filter, option) {
    //打开数据库
    return enrollProcessConfigureModel.update(filter, option, {
        multi: true
    }).exec();
};

EnrollProcessConfigure.rawAll = function () {
    return enrollProcessConfigureModel.find();
};