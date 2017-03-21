var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var adminEnrollExamSchema = new mongoose.Schema({
    name: String,
    address: String,
    isDeleted: Boolean
}, {
    collection: 'adminEnrollExams'
});

var adminEnrollExamModel = mongoose.model('adminEnrollExam', adminEnrollExamSchema);

function AdminEnrollExam(option) {
    this.option = option;
};

module.exports = AdminEnrollExam;

//存储学区信息
AdminEnrollExam.prototype.save = function(callback) {
    var newadminEnrollExam = new adminEnrollExamModel(this.option);

    newadminEnrollExam.save(function(err, adminEnrollExam) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollExam);

        //db.close();
    });
};

AdminEnrollExam.prototype.update = function(id, callback) {
    adminEnrollExamModel.update({
        _id: id
    }, this.option).exec(function(err, adminEnrollExam) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
AdminEnrollExam.get = function(id, callback) {
    //打开数据库
    adminEnrollExamModel.findOne({ _id: id, isDeleted: { $ne: true }}, function(err, adminEnrollExam) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollExam);

        //db.close();
    });
};

//一次获取20个学区信息
AdminEnrollExam.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = adminEnrollExamModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, adminEnrollExams) {
                callback(null, adminEnrollExams, count);
            });
    });
};

//删除一个学区
AdminEnrollExam.delete = function(id, callback) {
    adminEnrollExamModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, adminEnrollExam) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollExam);
    });
};