var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var studentInfoSchema = new mongoose.Schema({
    name: String,
    address: String,
    mobile: String,
    studentNo: String, //学号
    School: String,
    className: String,
    sex: Boolean, //0 男 1 女
    isDeleted: Boolean,
    accountId: String,
    discount: {
        type: Number,
        default: 100
    }, //原始购买打折(特价课程除外)
    gradeId: String,
    gradeName: String,
    createDate: {
        type: Date,
        default: Date.now
    },
    createdBy: String,
    DeleteDate: Date
}, {
    collection: 'studentInfos'
});

var studentInfoModel = mongoose.model('studentInfo', studentInfoSchema);

function StudentInfo(option) {
    this.option = option;
};

module.exports = StudentInfo;

//存储学区信息
StudentInfo.prototype.save = function () {
    this.option.isDeleted = false;
    var newstudentInfo = new studentInfoModel(this.option);

    return newstudentInfo.save();
};

StudentInfo.prototype.update = function (id, callback) {
    studentInfoModel.update({
        _id: id
    }, this.option).exec(function (err, studentInfo) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
StudentInfo.get = function (id) {
    //打开数据库
    return studentInfoModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
StudentInfo.getAll = function (id, page, filter, callback) {
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
    var query = studentInfoModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, studentInfos) {
                callback(null, studentInfos, count);
            });
    });
};

StudentInfo.getAllOfStudent = function (id, page, filter, callback) {
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
    var query = studentInfoModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            // .select({ 'name': 1 })
            .exec(function (err, studentInfos) {
                callback(null, studentInfos, count);
            });
    });
};

//删除一个学区
StudentInfo.delete = function (id, callback) {
    studentInfoModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, studentInfo) {
        if (err) {
            return callback(err);
        }
        callback(null, studentInfo);
    });
};

//读取学区信息
StudentInfo.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return studentInfoModel.findOne(filter);
};

StudentInfo.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return studentInfoModel.find(filter);
};

StudentInfo.deleteFilter = function (filter, callback) {
    studentInfoModel.update(filter, {
        isDeleted: true
    }).exec(function (err, studentInfo) {
        if (err) {
            return callback(err);
        }
        callback(null, studentInfo);
    });
};

StudentInfo.getAllDuplicated = function () {
    return studentInfoModel.aggregate({
            $match: {
                isDeleted: {
                    $ne: true
                }
            }
        })
        .group({
            _id: {
                name: "$name",
                mobile: "$mobile",
            },
            count: {
                $sum: 1
            }
        })
        .match({
            count: {
                $gt: 1
            }
        })
        .exec();

};

StudentInfo.deleteUser = function (id) {
    return studentInfoModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};


StudentInfo.updateUserInfo = function (filter, option) {
    //打开数据库
    return studentInfoModel.update(filter, option, {
        multi: true
    }).exec();
};