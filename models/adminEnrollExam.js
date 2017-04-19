var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var adminEnrollExamSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    mobile: String,
    examId: String,
    examName: String,
    examCategoryId: String,
    examCategoryName: String,
    isSucceed: Number, //1 succeed, 9 canceled 
    isPayed: Boolean,
    payWay: Number, //0 cash 1 offline card 8 online zhifubao 9 online weixin
    isDeleted: Boolean,
    orderDate: Date,
    CancelDate: Date,
    scores: [{
        subjectId: String,
        subjectName: String,
        score: Number,
        report: String
    }],
    examAreaId: String,
    examAreaName: String
}, {
    collection: 'adminEnrollExams'
});

var adminEnrollExamModel = mongoose.model('adminEnrollExam', adminEnrollExamSchema);

function AdminEnrollExam(option) {
    this.option = option;
};

module.exports = AdminEnrollExam;

//存储学区信息
AdminEnrollExam.prototype.save = function() {
    this.option.orderDate = new Date();
    var newadminEnrollExam = new adminEnrollExamModel(this.option);
    return newadminEnrollExam.save();
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
AdminEnrollExam.get = function(id) {
    //打开数据库
    return adminEnrollExamModel.findOne({ _id: id });
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

//读取学区信息
AdminEnrollExam.getByStudentAndCategory = function(studentId, categoryId, examId) {
    //打开数据库
    var filter = { studentId: studentId, isSucceed: 1, isDeleted: { $ne: true } };
    if (categoryId) {
        filter.examCategoryId = categoryId;
    } else {
        filter.examId = examId;
    }

    return adminEnrollExamModel.findOne(filter);
};

AdminEnrollExam.cancel = function(id, callback) {
    adminEnrollExamModel.update({
        _id: id
    }, {
        isSucceed: 9,
        CancelDate: new Date()
    }).exec(function(err, adminEnrollExam) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollExam);
    });
};

//一次获取20个学区信息
AdminEnrollExam.getAllWithoutPaging = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return adminEnrollExamModel.find(filter);
};

AdminEnrollExam.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return adminEnrollExamModel.findOne(filter);
};

AdminEnrollExam.getAllEnrolledWithoutPaging = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
        filter.isSucceed = 1;
    } else {
        filter = { isSucceed: 1, isDeleted: { $ne: true } };
    }
    return adminEnrollExamModel.find(filter);
};

AdminEnrollExam.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return adminEnrollExamModel.find(filter);
};