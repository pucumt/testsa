var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var examClassExamAreaSchema = new mongoose.Schema({
    examId: String,
    examCount: Number,
    enrollCount: Number,
    examAreaId: String,
    examAreaName: String,
    isDeleted: Boolean
}, {
    collection: 'examClassExamAreas'
});

var examClassExamAreaModel = mongoose.model('examClassExamArea', examClassExamAreaSchema);

function ExamClassExamArea(option) {
    this.option = option;
};

module.exports = ExamClassExamArea;

//存储学区信息
ExamClassExamArea.prototype.save = function(callback) {
    var newexamClassExamArea = new examClassExamAreaModel(this.option);

    newexamClassExamArea.save(function(err, examClassExamArea) {
        if (err) {
            return callback(err);
        }
        callback(null, examClassExamArea);

        //db.close();
    });
};

ExamClassExamArea.prototype.update = function(id, callback) {
    examClassExamAreaModel.update({
        _id: id
    }, this.option).exec(function(err, examClassExamArea) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ExamClassExamArea.get = function(id, callback) {
    //打开数据库
    examClassExamAreaModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, examClassExamArea) {
        if (err) {
            return callback(err);
        }
        callback(null, examClassExamArea);

        //db.close();
    });
};

//一次获取20个学区信息
ExamClassExamArea.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = examClassExamAreaModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, examClassExamAreas) {
                callback(null, examClassExamAreas, count);
            });
    });
};

//删除一个学区
ExamClassExamArea.delete = function(id, callback) {
    examClassExamAreaModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, examClassExamArea) {
        if (err) {
            return callback(err);
        }
        callback(null, examClassExamArea);
    });
};


ExamClassExamArea.enroll = function(id) {
    return examClassExamAreaModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            if (exam) {
                return examClassExamAreaModel.update({ //return examClassModel.findOneAndUpdate({
                    _id: id,
                    enrollCount: { $lt: exam.examCount }
                }, { $inc: { enrollCount: 1 } }).exec(); // }, { $inc: { enrollCount: 1 } }, { new: true }).exec();
            }
        });
};

ExamClassExamArea.cancel = function(id) {
    return examClassExamAreaModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            return examClassExamAreaModel.update({
                _id: id
            }, { $inc: { enrollCount: -1 } }).exec();
        });
};