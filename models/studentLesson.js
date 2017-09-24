var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var studentLessonSchema = new mongoose.Schema({
    studentId: ObjectId,
    lessonId: ObjectId,
    wordProcess: {
        type: Number,
        default: 0
    }, //单词进度
    wordAve: {
        type: Number,
        default: 0
    }, //单词平均分
    sentProcess: {
        type: Number,
        default: 0
    }, //句子进度
    sentAve: {
        type: Number,
        default: 0
    }, //句子平均分
    paragraphAve: {
        type: Number,
        default: 0
    }, //课文平均分
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
    collection: 'studentLessons'
});

var studentLessonModel = mongoose.model('studentLesson', studentLessonSchema);

function StudentLesson(option) {
    this.option = option;
};

module.exports = StudentLesson;

//存储学区信息
StudentLesson.prototype.save = function () {
    var newstudentLesson = new studentLessonModel(this.option);

    return newstudentLesson.save();
};

StudentLesson.prototype.update = function (id) {
    return studentLessonModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
StudentLesson.get = function (id) {
    //打开数据库
    return studentLessonModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
StudentLesson.getAll = function (id, page, filter, callback) {
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
    var query = studentLessonModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, studentLessons) {
                callback(null, studentLessons, count);
            });
    });
};

//删除一个学区
StudentLesson.delete = function (id, user) {
    return studentLessonModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

StudentLesson.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return studentLessonModel.findOne(filter);
};

StudentLesson.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return studentLessonModel.find(filter);
};

StudentLesson.batchUpdate = function (filter, option) {
    //打开数据库
    return studentLessonModel.update(filter, option, {
        multi: true
    }).exec();
};

StudentLesson.rawAll = function () {
    return studentLessonModel.find();
};