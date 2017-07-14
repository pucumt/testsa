var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var changeEndSchema = new mongoose.Schema({
    endDate: Date
}, {
    collection: 'changeEnds'
});

var changeEndModel = mongoose.model('changeEnd', changeEndSchema);

function ChangeEnd(option) {
    this.option = option;
};

module.exports = ChangeEnd;

//存储学区信息
ChangeEnd.prototype.save = function(callback) {
    var newchangeEnd = new changeEndModel(this.option);

    newchangeEnd.save(function(err, changeEnd) {
        if (err) {
            return callback(err);
        }
        callback(null, changeEnd);

        //db.close();
    });
};

ChangeEnd.prototype.update = function(id, callback) {
    changeEndModel.update({
        _id: id
    }, this.option).exec(function(err, changeEnd) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ChangeEnd.get = function() {
    //打开数据库
    return changeEndModel.findOne({});
};

//删除一个学区
ChangeEnd.delete = function(id, callback) {
    changeEndModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, changeEnd) {
        if (err) {
            return callback(err);
        }
        callback(null, changeEnd);
    });
};