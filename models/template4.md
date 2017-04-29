var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var #name#Schema = new mongoose.Schema({
    name: String,
    address: String,
    isDeleted: { type: Boolean, default: false }
}, {
    collection: '#name#s'
});

var #name#Model = mongoose.model('#name#', #name#Schema);

function #Name#(option) {
    this.option = option;
};

module.exports = #Name#;

//存储学区信息
#Name#.prototype.save = function(callback) {
    var new#name# = new #name#Model(this.option);

    new#name#.save(function(err, #name#) {
        if (err) {
            return callback(err);
        }
        callback(null, #name#);

        //db.close();
    });
};

#Name#.prototype.update = function(id, callback) {
    #name#Model.update({
        _id: id
    }, this.option).exec(function(err, #name#) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
#Name#.get = function(id, callback) {
    //打开数据库
    #name#Model.findOne({ _id: id, isDeleted: { $ne: true }}, function(err, #name#) {
        if (err) {
            return callback(err);
        }
        callback(null, #name#);

        //db.close();
    });
};

//一次获取20个学区信息
#Name#.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = #name#Model.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, #name#s) {
                callback(null, #name#s, count);
            });
    });
};

//删除一个学区
#Name#.delete = function(id, callback) {
    #name#Model.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, #name#) {
        if (err) {
            return callback(err);
        }
        callback(null, #name#);
    });
};