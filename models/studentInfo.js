var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var studentInfoSchema = new mongoose.Schema({
    name: String,
    address: String,
    mobile: String,
    studentNo: String, //学号
    School: String,
    sex: Boolean, //0 男 1 女
    isDeleted: Boolean,
    accountId: String
}, {
    collection: 'studentInfos'
});

var studentInfoModel = mongoose.model('studentInfo', studentInfoSchema);

function StudentInfo(option) {
    this.option = option;
};

module.exports = StudentInfo;

//存储学区信息
StudentInfo.prototype.save = function() {
    var newstudentInfo = new studentInfoModel(this.option);

    return newstudentInfo.save();
};

StudentInfo.prototype.update = function(id, callback) {
    studentInfoModel.update({
        _id: id
    }, this.option).exec(function(err, studentInfo) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
StudentInfo.get = function(id, callback) {
    //打开数据库
    studentInfoModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, studentInfo) {
        if (err) {
            return callback(err);
        }
        callback(null, studentInfo);

        //db.close();
    });
};

//一次获取20个学区信息
StudentInfo.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = studentInfoModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, studentInfos) {
                callback(null, studentInfos, count);
            });
    });
};

//删除一个学区
StudentInfo.delete = function(id, callback) {
    studentInfoModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, studentInfo) {
        if (err) {
            return callback(err);
        }
        callback(null, studentInfo);
    });
};

//读取学区信息
StudentInfo.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return studentInfoModel.findOne(filter);
};