var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var subjectSchema = new mongoose.Schema({
    name: String,
    isDeleted: Boolean
}, {
    collection: 'subjects'
});

var subjectModel = mongoose.model('subject', subjectSchema);

function Subject(option) {
    this.option = option;
};

module.exports = Subject;

//存储学区信息
Subject.prototype.save = function(callback) {
    var newsubject = new subjectModel(this.option);

    newsubject.save(function(err, subject) {
        if (err) {
            return callback(err);
        }
        callback(null, subject);

        //db.close();
    });
};

Subject.prototype.update = function(id, callback) {
    subjectModel.update({
        _id: id
    }, this.option).exec(function(err, subject) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
Subject.get = function(id, callback) {
    //打开数据库
    subjectModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, subject) {
        if (err) {
            return callback(err);
        }
        callback(null, subject);

        //db.close();
    });
};

//一次获取20个学区信息
Subject.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = subjectModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, subjects) {
                callback(null, subjects, count);
            });
    });
};

//删除一个学区
Subject.delete = function(id, callback) {
    subjectModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, subject) {
        if (err) {
            return callback(err);
        }
        callback(null, subject);
    });
};

//一次获取所有信息
Subject.getAllWithoutPage = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return subjectModel.find(filter).exec();
};

Subject.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return subjectModel.findOne(filter);
};

Subject.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return subjectModel.find(filter);
};