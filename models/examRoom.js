var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var examRoomSchema = new mongoose.Schema({
    examId: String,
    examName: String,
    isDeleted: Boolean,
    classRooms: [{
        classRoomId: String,
        classRoomName: String,
        examCount: Number
    }]
}, {
    collection: 'examRooms'
});

var examRoomModel = mongoose.model('examRoom', examRoomSchema);

function ExamRoom(option) {
    this.option = option;
};

module.exports = ExamRoom;

//存储学区信息
ExamRoom.prototype.save = function () {
    var newexamRoom = new examRoomModel(this.option);
    return newexamRoom.save();
};

ExamRoom.prototype.update = function (id, callback) {
    examRoomModel.update({
        _id: id
    }, this.option).exec(function (err, examRoom) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ExamRoom.get = function (id) {
    //打开数据库
    return examRoomModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
ExamRoom.getAll = function (id, page, filter, callback) {
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
    var query = examRoomModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, examRooms) {
                callback(null, examRooms, count);
            });
    });
};

//删除一个学区
ExamRoom.delete = function (id, callback) {
    examRoomModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, examRoom) {
        if (err) {
            return callback(err);
        }
        callback(null, examRoom);
    });
};

ExamRoom.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return examRoomModel.findOne(filter);
};

ExamRoom.rawAll = function () {
    return examRoomModel.find();
};