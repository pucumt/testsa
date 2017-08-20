var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var lessionSchema = new mongoose.Schema({
    name: String,
    bookId: ObjectId,
    bookName: String, //TBD
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
    deletedDate: Date,
    sequence: {
        type: Number,
        default: 0
    }
}, {
    collection: 'lessions'
});

var lessionModel = mongoose.model('lession', lessionSchema);

function Lession(option) {
    this.option = option;
};

module.exports = Lession;

//存储学区信息
Lession.prototype.save = function () {
    var newlession = new lessionModel(this.option);

    return newlession.save();
};

Lession.prototype.update = function (id) {
    return lessionModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
Lession.get = function (id) {
    //打开数据库
    return lessionModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
Lession.getAll = function (id, page, filter, callback) {
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
    var query = lessionModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, lessions) {
                callback(null, lessions, count);
            });
    });
};

//删除一个学区
Lession.delete = function (id, user) {
    return lessionModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

Lession.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessionModel.findOne(filter);
};

Lession.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return lessionModel.find(filter);
};

Lession.batchUpdate = function (filter, option) {
    //打开数据库
    return lessionModel.update(filter, option, {
        multi: true
    }).exec();
};