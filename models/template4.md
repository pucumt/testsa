var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var #name#Schema = new mongoose.Schema({
    name: String,
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
    deletedDate: Date
}, {
    collection: '#name#s'
});

var #name#Model = mongoose.model('#name#', #name#Schema);

function #Name#(option) {
    this.option = option;
};

module.exports = #Name#;

//存储学区信息
#Name#.prototype.save = function() {
    var new#name# = new #name#Model(this.option);

    return new#name#.save();
};

#Name#.prototype.update = function(id) {
    return #name#Model.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
#Name#.get = function(id) {
    //打开数据库
    return #name#Model.findOne({ _id: id, isDeleted: { $ne: true }});
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
#Name#.delete = function(id, user) {
    return #name#Model.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

#Name#.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return #name#Model.findOne(filter);
};

#Name#.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return #name#Model.find(filter);
};

#Name#.batchUpdate = function(filter, option) {
    //打开数据库
    return #name#Model.update(filter, option, { multi: true }).exec();
};
