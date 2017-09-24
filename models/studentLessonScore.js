var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var studentLessonScoreSchema = new mongoose.Schema({
    studentId: ObjectId,
    lessonId: ObjectId,
    contentId: ObjectId,
    contentRecord: String, //录音链接？？
    contentType: Number, //0 content 1 word 2 sentence
    score: Number,
    createdBy: String,
    createdDate: {
        type: Date,
        default: Date.now
    },
    deletedBy: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedDate: Date
}, {
    collection: 'studentLessonScores'
});

var studentLessonScoreModel = mongoose.model('studentLessonScore', studentLessonScoreSchema);

function StudentLessonScore(option) {
    this.option = option;
};

module.exports = StudentLessonScore;

//存储学区信息
StudentLessonScore.prototype.save = function () {
    var newstudentLessonScore = new studentLessonScoreModel(this.option);

    return newstudentLessonScore.save();
};

StudentLessonScore.prototype.update = function (id) {
    return studentLessonScoreModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
StudentLessonScore.get = function (id) {
    //打开数据库
    return studentLessonScoreModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
StudentLessonScore.getAll = function (id, page, filter, callback) {
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
    var query = studentLessonScoreModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, studentLessonScores) {
                callback(null, studentLessonScores, count);
            });
    });
};

//删除一个学区
StudentLessonScore.delete = function (id, user) {
    return studentLessonScoreModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

StudentLessonScore.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return studentLessonScoreModel.findOne(filter);
};

StudentLessonScore.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return studentLessonScoreModel.find(filter);
};

StudentLessonScore.batchUpdate = function (filter, option) {
    //打开数据库
    return studentLessonScoreModel.update(filter, option, {
        multi: true
    }).exec();
};

StudentLessonScore.getAverage = function (lessonId, studentId, contentType) {
    //打开数据库
    return studentLessonScoreModel.aggregate({
            $match: {
                lessonId: mongoose.Types.ObjectId(lessonId),
                studentId: mongoose.Types.ObjectId(studentId),
                contentType: parseInt(contentType)
            }
        })
        .group({
            _id: null,
            score: {
                $avg: "$score"
            }
        }).exec();
};

StudentLessonScore.rawAll = function () {
    return studentLessonScoreModel.find();
};