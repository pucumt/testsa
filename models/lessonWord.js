var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var lessonWordSchema = new mongoose.Schema({
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
    collection: 'lessonWords'
});

var lessonWordModel = mongoose.model('lessonWord', lessonWordSchema);

function LessonWord(option) {
    this.option = option;
};

module.exports = LessonWord;

//存储学区信息
LessonWord.prototype.save = function () {
    var newlessonWord = new lessonWordModel(this.option);

    return newlessonWord.save();
};

LessonWord.prototype.update = function (id) {
    return lessonWordModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
LessonWord.get = function (id) {
    //打开数据库
    return lessonWordModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
LessonWord.getAll = function (id, page, filter, callback) {
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
    var query = lessonWordModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, lessonWords) {
                callback(null, lessonWords, count);
            });
    });
};

//删除一个学区
LessonWord.delete = function (id, user) {
    return lessonWordModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

LessonWord.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonWordModel.findOne(filter);
};

LessonWord.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonWordModel.find(filter);
};

LessonWord.batchUpdate = function (filter, option) {
    //打开数据库
    return lessonWordModel.update(filter, option, {
        multi: true
    }).exec();
};