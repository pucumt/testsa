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
ExamClassExamArea.prototype.save = function () {
    var newexamClassExamArea = new examClassExamAreaModel(this.option);

    return newexamClassExamArea.save();
};

ExamClassExamArea.prototype.update = function (id) {
    return examClassExamAreaModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
ExamClassExamArea.get = function (id) {
    //打开数据库
    return examClassExamAreaModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
ExamClassExamArea.getAll = function (id, page, filter, callback) {
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
    var query = examClassExamAreaModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, examClassExamAreas) {
                callback(null, examClassExamAreas, count);
            });
    });
};

ExamClassExamArea.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return examClassExamAreaModel.findOne(filter);
};

ExamClassExamArea.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return examClassExamAreaModel.find(filter);
};

//删除一个学区
ExamClassExamArea.delete = function (id) {
    return examClassExamAreaModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};

ExamClassExamArea.deleteFilter = function (filter) {
    return examClassExamAreaModel.update(filter, {
        isDeleted: true
    }).exec();
};


ExamClassExamArea.enroll = function (id) {
    return examClassExamAreaModel.findOne({
            _id: id,
            isDeleted: {
                $ne: true
            }
        })
        .then(function (exam) {
            if (exam) {
                return examClassExamAreaModel.update({ //return examClassModel.findOneAndUpdate({
                    _id: id,
                    enrollCount: {
                        $lt: exam.examCount
                    }
                }, {
                    $inc: {
                        enrollCount: 1
                    }
                }).exec(); // }, { $inc: { enrollCount: 1 } }, { new: true }).exec();
            }
        });
};

ExamClassExamArea.cancel = function (id) {
    return examClassExamAreaModel.findOne({
            _id: id,
            isDeleted: {
                $ne: true
            }
        })
        .then(function (exam) {
            return examClassExamAreaModel.update({
                _id: id
            }, {
                $inc: {
                    enrollCount: -1
                }
            }).exec();
        });
};

ExamClassExamArea.rawAll = function () {
    return examClassExamAreaModel.find();
};