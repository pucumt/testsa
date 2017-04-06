var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var studentAccountSchema = new mongoose.Schema({
    name: String,
    password: String,
    wechat: String,
    isDeleted: Boolean
}, {
    collection: 'studentAccounts'
});

var studentAccountModel = mongoose.model('studentAccount', studentAccountSchema);

function StudentAccount(option) {
    this.option = option;
};

module.exports = StudentAccount;

//存储学区信息
StudentAccount.prototype.save = function() {
    var newstudentAccount = new studentAccountModel(this.option);
    return newstudentAccount.save();
};

StudentAccount.prototype.update = function(id, callback) {
    studentAccountModel.update({
        _id: id
    }, this.option).exec(function(err, studentAccount) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
StudentAccount.get = function(id) {
    //打开数据库
    return studentAccountModel.findOne({ _id: id, isDeleted: { $ne: true } });
};

//一次获取20个学区信息
StudentAccount.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = studentAccountModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, studentAccounts) {
                callback(null, studentAccounts, count);
            });
    });
};

//删除一个学区
StudentAccount.delete = function(id, callback) {
    studentAccountModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, studentAccount) {
        if (err) {
            return callback(err);
        }
        callback(null, studentAccount);
    });
};

//读取学区信息
StudentAccount.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return studentAccountModel.findOne(filter);
};