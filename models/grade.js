var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var gradeSchema = new mongoose.Schema({
    name: String,
    address: String,
    isDeleted: Boolean
}, {
    collection: 'grades'
});

var gradeModel = mongoose.model('grade', gradeSchema);

function Grade(option) {
    this.option = option;
};

module.exports = Grade;

//存储学区信息
Grade.prototype.save = function(callback) {
    var newgrade = new gradeModel(this.option);

    newgrade.save(function(err, grade) {
        if (err) {
            return callback(err);
        }
        callback(null, grade);

        //db.close();
    });
};

Grade.prototype.update = function(id, callback) {
    gradeModel.update({
        _id: id
    }, this.option).exec(function(err, grade) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
Grade.get = function(id, callback) {
    //打开数据库
    gradeModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, grade) {
        if (err) {
            return callback(err);
        }
        callback(null, grade);

        //db.close();
    });
};

//一次获取20个学区信息
Grade.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = gradeModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .exec(function(err, grades) {
                callback(null, grades, count);
            });
    });
};

//删除一个学区
Grade.delete = function(id, callback) {
    gradeModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, grade) {
        if (err) {
            return callback(err);
        }
        callback(null, grade);
    });
};