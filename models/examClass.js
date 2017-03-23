var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var examClassSchema = new mongoose.Schema({
    name: String,
    address: String,
    examDate: Date,
    examTime: String,
    examCategoryId: String,
    examCategoryName: String,
    examCount: Number,
    enrollCount: Number,
    isDeleted: Boolean,
    isWeixin: Number //0 new 1 publish 0 stop
}, {
    collection: 'examClasss'
});

var examClassModel = mongoose.model('examClass', examClassSchema);

function ExamClass(option) {
    this.option = option;
};

module.exports = ExamClass;

//存储学区信息
ExamClass.prototype.save = function(callback) {
    this.option.enrollCount = 0;
    this.option.isWeixin = 0;
    var newexamClass = new examClassModel(this.option);

    newexamClass.save(function(err, examClass) {
        if (err) {
            return callback(err);
        }
        callback(null, examClass);

        //db.close();
    });
};

ExamClass.prototype.update = function(id, callback) {
    examClassModel.update({
        _id: id
    }, this.option).exec(function(err, examClass) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ExamClass.get = function(id, callback) {
    //打开数据库
    examClassModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, examClass) {
        if (err) {
            return callback(err);
        }
        callback(null, examClass);

        //db.close();
    });
};

//一次获取20个学区信息
ExamClass.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = examClassModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, examClasss) {
                callback(null, examClasss, count);
            });
    });
};

//删除一个学区
ExamClass.delete = function(id, callback) {
    examClassModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, examClass) {
        if (err) {
            return callback(err);
        }
        callback(null, examClass);
    });
};

//发布
ExamClass.publish = function(id, callback) {
    examClassModel.update({
        _id: id
    }, {
        isWeixin: 1
    }).exec(function(err, examClasss) {
        if (err) {
            return callback(err);
        }
        callback(null, examClasss);
    });
};

//停用
ExamClass.unPublish = function(id, callback) {
    examClassModel.update({
        _id: id
    }, {
        isWeixin: 9
    }).exec(function(err, examClasss) {
        if (err) {
            return callback(err);
        }
        callback(null, examClasss);
    });
};

ExamClass.enroll = function(id) {
    return examClassModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            return examClassModel.update({
                _id: id,
                enrollCount: { $lt: exam.examCount }
            }, { $inc: { enrollCount: 1 } }).exec();
        });
};

ExamClass.cancel = function(id) {
    return examClassModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            return examClassModel.update({
                _id: id
            }, { $inc: { enrollCount: -1 } }).exec();
        });
};