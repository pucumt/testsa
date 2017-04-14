var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var examAreaSchema = new mongoose.Schema({
    name: String,
    address: String,
    isDeleted: Boolean
}, {
    collection: 'examAreas'
});

var examAreaModel = mongoose.model('examArea', examAreaSchema);

function ExamArea(option) {
    this.option = option;
};

module.exports = ExamArea;

//存储学区信息
ExamArea.prototype.save = function(callback) {
    var newexamArea = new examAreaModel(this.option);

    newexamArea.save(function(err, examArea) {
        if (err) {
            return callback(err);
        }
        callback(null, examArea);

        //db.close();
    });
};

ExamArea.prototype.update = function(id, callback) {
    examAreaModel.update({
        _id: id
    }, this.option).exec(function(err, examArea) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ExamArea.get = function(id, callback) {
    //打开数据库
    examAreaModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, examArea) {
        if (err) {
            return callback(err);
        }
        callback(null, examArea);

        //db.close();
    });
};

//一次获取20个学区信息
ExamArea.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = examAreaModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, examAreas) {
                callback(null, examAreas, count);
            });
    });
};

//删除一个学区
ExamArea.delete = function(id, callback) {
    examAreaModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, examArea) {
        if (err) {
            return callback(err);
        }
        callback(null, examArea);
    });
};

//一次获取所有信息
ExamArea.getAllWithoutPage = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return examAreaModel.find(filter).exec();
};