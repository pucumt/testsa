var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var yearSchema = new mongoose.Schema({
    name: String,
    isDeleted: Boolean,
    isCurrentYear: { type: Boolean, default: false },
    sequence: { type: Number, default: 0 }
}, {
    collection: 'years'
});

var yearModel = mongoose.model('year', yearSchema);

function Year(option) {
    this.option = option;
};

module.exports = Year;

//存储学区信息
Year.prototype.save = function(callback) {
    var newyear = new yearModel(this.option);

    newyear.save(function(err, year) {
        if (err) {
            return callback(err);
        }
        callback(null, year);

        //db.close();
    });
};

Year.prototype.update = function(id, callback) {
    yearModel.update({
        _id: id
    }, this.option).exec(function(err, year) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
Year.get = function(id, callback) {
    //打开数据库
    yearModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, year) {
        if (err) {
            return callback(err);
        }
        callback(null, year);

        //db.close();
    });
};

//一次获取20个学区信息
Year.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = yearModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .sort({ sequence: 1, _id: 1 })
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, years) {
                callback(null, years, count);
            });
    });
};

//删除一个学区
Year.delete = function(id, callback) {
    yearModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, year) {
        if (err) {
            return callback(err);
        }
        callback(null, year);
    });
};

//一次获取所有信息
Year.getAllWithoutPage = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return yearModel.find(filter)
        .sort({ sequence: 1, _id: 1 })
        .exec();
};

Year.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return yearModel.findOne(filter);
};

Year.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return yearModel.find(filter)
        .sort({ sequence: 1, _id: 1 });
};

Year.clearCurrentYear = function() {
    //打开数据库
    return yearModel.update({
        isCurrentYear: true
    }, { isCurrentYear: false }).exec();
};