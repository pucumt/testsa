var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var weekTypeSchema = new mongoose.Schema({
    name: String,
    isChecked: { type: Boolean, default: true }, //是否使用
    isDeleted: { type: Boolean, default: false }
}, {
    collection: 'weekTypes'
});

var weekTypeModel = mongoose.model('weekType', weekTypeSchema);

function WeekType(option) {
    this.option = option;
};

module.exports = WeekType;

//存储学区信息
WeekType.prototype.save = function(callback) {
    var newweekType = new weekTypeModel(this.option);

    newweekType.save(function(err, weekType) {
        if (err) {
            return callback(err);
        }
        callback(null, weekType);

        //db.close();
    });
};

WeekType.prototype.update = function(id, callback) {
    weekTypeModel.update({
        _id: id
    }, this.option).exec(function(err, weekType) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
WeekType.get = function(id, callback) {
    //打开数据库
    weekTypeModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, weekType) {
        if (err) {
            return callback(err);
        }
        callback(null, weekType);

        //db.close();
    });
};

//一次获取20个学区信息
WeekType.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = weekTypeModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, weekTypes) {
                callback(null, weekTypes, count);
            });
    });
};

//删除一个学区
WeekType.delete = function(id, callback) {
    weekTypeModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, weekType) {
        if (err) {
            return callback(err);
        }
        callback(null, weekType);
    });
};

WeekType.updateBatch = function(filter, updated) {
    return weekTypeModel.update(filter, updated, { multi: true })
        .exec();
};

WeekType.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return weekTypeModel.find(filter);
};