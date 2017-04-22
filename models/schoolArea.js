var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var schoolAreaSchema = new mongoose.Schema({
    name: String,
    address: String,
    isDeleted: Boolean
}, {
    collection: 'schoolAreas'
});

var schoolAreaModel = mongoose.model('schoolArea', schoolAreaSchema);

function SchoolArea(option) {
    this.option = option;
};

module.exports = SchoolArea;

//存储学区信息
SchoolArea.prototype.save = function(callback) {
    var newschoolArea = new schoolAreaModel(this.option);

    newschoolArea.save(function(err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);

        //db.close();
    });
};

SchoolArea.prototype.update = function(id, callback) {
    schoolAreaModel.update({
        _id: id
    }, this.option).exec(function(err, schoolArea) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
SchoolArea.get = function(id, callback) {
    //打开数据库
    schoolAreaModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);

        //db.close();
    });
};

//一次获取20个学区信息
SchoolArea.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = schoolAreaModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .exec(function(err, schoolAreas) {
                callback(null, schoolAreas, count);
            });
    });
};

//删除一个学区
SchoolArea.delete = function(id, callback) {
    schoolAreaModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);
    });
};

//一次获取所有信息
SchoolArea.getAllWithoutPage = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return schoolAreaModel.find(filter).exec();
};