var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var teacherSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    address: String,
    isDeleted: Boolean
}, {
    collection: 'teachers'
});

var teacherModel = mongoose.model('teacher', teacherSchema);

function Teacher(option) {
    this.option = option;
};

module.exports = Teacher;

//存储学区信息
Teacher.prototype.save = function(callback) {
    var newteacher = new teacherModel(this.option);

    newteacher.save(function(err, teacher) {
        if (err) {
            return callback(err);
        }
        callback(null, teacher);

        //db.close();
    });
};

Teacher.prototype.update = function(id, callback) {
    teacherModel.update({
        _id: id
    }, this.option).exec(function(err, teacher) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
Teacher.get = function(id, callback) {
    //打开数据库
    teacherModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, teacher) {
        if (err) {
            return callback(err);
        }
        callback(null, teacher);

        //db.close();
    });
};

//一次获取20个学区信息
Teacher.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = teacherModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, teachers) {
                callback(null, teachers, count);
            });
    });
};

//删除一个学区
Teacher.delete = function(id, callback) {
    teacherModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, teacher) {
        if (err) {
            return callback(err);
        }
        callback(null, teacher);
    });
};