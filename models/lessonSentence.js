var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var lessonSentenceSchema = new mongoose.Schema({
    name: String,
    lessonId: ObjectId,
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
    collection: 'lessonSentences'
});

var lessonSentenceModel = mongoose.model('lessonSentence', lessonSentenceSchema);

function LessonSentence(option) {
    this.option = option;
};

module.exports = LessonSentence;

//存储学区信息
LessonSentence.prototype.save = function () {
    var newlessonSentence = new lessonSentenceModel(this.option);

    return newlessonSentence.save();
};

LessonSentence.prototype.update = function (id) {
    return lessonSentenceModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
LessonSentence.get = function (id) {
    //打开数据库
    return lessonSentenceModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
LessonSentence.getAll = function (id, page, filter, callback) {
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
    var query = lessonSentenceModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, lessonSentences) {
                callback(null, lessonSentences, count);
            });
    });
};

//删除一个学区
LessonSentence.delete = function (id, user) {
    return lessonSentenceModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

LessonSentence.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonSentenceModel.findOne(filter);
};

LessonSentence.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonSentenceModel.find(filter);
};

LessonSentence.batchUpdate = function (filter, option) {
    //打开数据库
    return lessonSentenceModel.update(filter, option, {
        multi: true
    }).exec();
};