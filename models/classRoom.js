var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var classRoomSchema = new mongoose.Schema({
    name: String,
    sCount: Number,
    schoolId: String,
    schoolArea: String,
    isDeleted: Boolean
}, {
    collection: 'classRooms'
});

var classRoomModel = mongoose.model('classRoom', classRoomSchema);

function ClassRoom(option) {
    this.option = option;
};

module.exports = ClassRoom;

//存储学区信息
ClassRoom.prototype.save = function(callback) {
    var newclassRoom = new classRoomModel(this.option);

    newclassRoom.save(function(err, classRoom) {
        if (err) {
            return callback(err);
        }
        callback(null, classRoom);

        //db.close();
    });
};

ClassRoom.prototype.update = function(id, callback) {
    classRoomModel.update({
        _id: id
    }, this.option).exec(function(err, classRoom) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ClassRoom.get = function(id) {
    //打开数据库
    return classRoomModel.findOne({ _id: id, isDeleted: { $ne: true } });
};

//一次获取20个学区信息
ClassRoom.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = classRoomModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, classRooms) {
                callback(null, classRooms, count);
            });
    });
};

//删除一个学区
ClassRoom.delete = function(id, callback) {
    classRoomModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, classRoom) {
        if (err) {
            return callback(err);
        }
        callback(null, classRoom);
    });
};

//一次获取20个学区信息
ClassRoom.getAllWithoutPage = function(filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = classRoomModel.find(filter)
        .exec(function(err, classRooms) {
            callback(null, classRooms);
        });
};