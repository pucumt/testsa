var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var lessonSchema = new mongoose.Schema({
    name: String,
    bookId: ObjectId,
    bookName: String, //TBD
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
    }
}, {
    collection: 'lessons'
});

var lessonModel = mongoose.model('lesson', lessonSchema);

function Lesson(option) {
    this.option = option;
};

module.exports = Lesson;

//存储学区信息
Lesson.prototype.save = function () {
    var newlesson = new lessonModel(this.option);

    return newlesson.save();
};

Lesson.prototype.update = function (id) {
    return lessonModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
Lesson.get = function (id) {
    //打开数据库
    return lessonModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
Lesson.getAll = function (id, page, filter, callback) {
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
    var query = lessonModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .sort({
                sequence: 1,
                _id: 1
            })
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, lessons) {
                callback(null, lessons, count);
            });
    });
};

//删除一个学区
Lesson.delete = function (id, user) {
    return lessonModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

Lesson.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonModel.findOne(filter);
};

Lesson.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessonModel.find(filter)
        .sort({
            sequence: 1,
            _id: 1
        });
};

Lesson.batchUpdate = function (filter, option) {
    //打开数据库
    return lessonModel.update(filter, option, {
        multi: true
    }).exec();
};