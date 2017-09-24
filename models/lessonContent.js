var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var lessonContentSchema = new mongoose.Schema({
    name: String,
    lessonId: ObjectId,
    contentType: Number, //0 content 1 word 2 sentence
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
    deletedDate: Date,
    sequence: {
        type: Number,
        default: 0
    },
    duration: Number // 课文需要设置时间段

}, {
    collection: 'lessonContents'
});

var lessonContentModel = mongoose.model('lessonContent', lessonContentSchema);

function LessonContent(option) {
    this.option = option;
};

module.exports = LessonContent;

//存储学区信息
LessonContent.prototype.save = function () {
    var newlessonContent = new lessonContentModel(this.option);

    return newlessonContent.save();
};

LessonContent.prototype.update = function (id) {
    return lessonContentModel.update({
        _id: id
    }, this.option).exec();
};

LessonContent.insertMany = function (docs) {
    return lessonContentModel.insertMany(docs);
};
//读取学区信息
LessonContent.get = function (id) {
    //打开数据库
    return lessonContentModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
LessonContent.getAll = function (id, page, filter, callback) {
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
    var query = lessonContentModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .sort({
                sequence: 1,
                _id: 1
            })
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, lessonContents) {
                callback(null, lessonContents, count);
            });
    });
};

//删除一个学区
LessonContent.delete = function (id, user) {
    return lessonContentModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

LessonContent.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonContentModel.findOne(filter);
};

LessonContent.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonContentModel.find(filter)
        .sort({
            sequence: 1,
            _id: 1
        });
};

LessonContent.batchUpdate = function (filter, option) {
    //打开数据库
    return lessonContentModel.update(filter, option, {
        multi: true
    }).exec();
};

LessonContent.getCount = function (lessonId) {
    //打开数据库
    return lessonContentModel.aggregate({
            $match: {
                lessonId: mongoose.Types.ObjectId(lessonId),
                isDeleted: {
                    $ne: true
                }
            }
        })
        .group({
            _id: "$contentType",
            count: {
                $sum: 1
            }
        }).exec();
};

LessonContent.getContentOfSequence = function (filter, skipCount) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonContentModel.find(filter)
        .sort({
            sequence: 1,
            _id: 1
        })
        .skip(skipCount)
        .limit(1)
        .exec();
};

LessonContent.rawAll = function () {
    return lessonContentModel.find();
};