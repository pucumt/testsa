var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var schoolAreaSchema = new mongoose.Schema({
    name: String,
    address: String,
    isDeleted: Boolean,
    sequence: {
        type: Number,
        default: 0
    }
}, {
    collection: 'schoolAreas'
});

var schoolAreaModel = mongoose.model('schoolArea', schoolAreaSchema);

function SchoolArea(option) {
    this.option = option;
};

module.exports = SchoolArea;

//存储学区信息
SchoolArea.prototype.save = function (callback) {
    var newschoolArea = new schoolAreaModel(this.option);

    newschoolArea.save(function (err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);

        //db.close();
    });
};

SchoolArea.prototype.update = function (id, callback) {
    schoolAreaModel.update({
        _id: id
    }, this.option).exec(function (err, schoolArea) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
SchoolArea.get = function (id) {
    //打开数据库
    return schoolAreaModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
SchoolArea.getAll = function (id, page, filter, callback) {
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
    var query = schoolAreaModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .sort({
                sequence: 1,
                _id: 1
            })
            .exec(function (err, schoolAreas) {
                callback(null, schoolAreas, count);
            });
    });
};

//删除一个学区
SchoolArea.delete = function (id, callback) {
    schoolAreaModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);
    });
};

//一次获取所有信息
SchoolArea.getAllWithoutPage = function (filter) {
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
    return schoolAreaModel.find(filter)
        .sort({
            sequence: 1,
            _id: 1
        })
        .exec();
};

SchoolArea.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return schoolAreaModel.findOne(filter);
};

SchoolArea.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return schoolAreaModel.find(filter)
        .sort({
            sequence: 1,
            _id: 1
        });
};

SchoolArea.rawAll = function () {
    return schoolAreaModel.find();
};