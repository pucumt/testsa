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
    courseContent: String,
    examCount: Number,
    enrollCount: Number,
    isDeleted: Boolean,
    isWeixin: Number, //0 new 1 publish 9 stop
    subjects: [{
        subjectId: String,
        subjectName: String
    }],
    seatNumber: Number,
    examAreaId: String, //means old enroll
    examAreaName: String,
    isScorePublished: { type: Boolean, default: false },
    sequence: { type: Number, default: 0 }
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
ExamClass.get = function(id) {
    //打开数据库
    return examClassModel.findOne({ _id: id });
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
            .sort({ sequence: 1, _id: 1 })
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

ExamClass.publishAll = function(ids, callback) {
    examClassModel.update({
        _id: { $in: ids }
    }, {
        isWeixin: 1
    }, { multi: true }).exec(function(err, examClasss) {
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

ExamClass.unPublishAll = function(ids, callback) {
    examClassModel.update({
        _id: { $in: ids }
    }, {
        isWeixin: 9
    }, { multi: true }).exec(function(err, examClasss) {
        if (err) {
            return callback(err);
        }
        callback(null, examClasss);
    });
};

ExamClass.enroll = function(id) {
    return examClassModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            if (exam) {
                return examClassModel.update({ //return examClassModel.findOneAndUpdate({
                    _id: id,
                    enrollCount: { $lt: exam.examCount }
                }, { $inc: { enrollCount: 1 } }).exec(); // }, { $inc: { enrollCount: 1 } }, { new: true }).exec();
            }
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


ExamClass.enroll2 = function(id) {
    return examClassModel.update({
        _id: id
    }, { $inc: { enrollCount: 1 } }).exec();
};

ExamClass.cancel2 = function(id) {
    return examClassModel.update({
        _id: id
    }, { $inc: { enrollCount: -1 } }).exec();
};

ExamClass.getAllWithoutPage = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return examClassModel.find(filter).exec();
};

ExamClass.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return examClassModel.findOne(filter);
};

ExamClass.showScore = function(id, isScorePublished, callback) {
    examClassModel.update({
        _id: id
    }, {
        isScorePublished: (isScorePublished == "true" ? false : true)
    }).exec(function(err, examClasss) {
        if (err) {
            return callback(err);
        }
        callback(null, examClasss);
    });
};