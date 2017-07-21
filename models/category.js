var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var categorySchema = new mongoose.Schema({
    name: String,
    grade: { type: Number, default: 0 }, //基础班0 培优班5 通中预备10 通中15。可以下调
    isDeleted: Boolean
}, {
    collection: 'categorys'
});

var categoryModel = mongoose.model('category', categorySchema);

function Category(option) {
    this.option = option;
};

module.exports = Category;

//存储学区信息
Category.prototype.save = function(callback) {
    var newcategory = new categoryModel(this.option);

    newcategory.save(function(err, category) {
        if (err) {
            return callback(err);
        }
        callback(null, category);

        //db.close();
    });
};

Category.prototype.update = function(id, callback) {
    categoryModel.update({
        _id: id
    }, this.option).exec(function(err, category) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
Category.get = function(id, callback) {
    //打开数据库
    categoryModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, category) {
        if (err) {
            return callback(err);
        }
        callback(null, category);

        //db.close();
    });
};

//一次获取20个学区信息
Category.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = categoryModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, categorys) {
                callback(null, categorys, count);
            });
    });
};

//删除一个学区
Category.delete = function(id, callback) {
    categoryModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, category) {
        if (err) {
            return callback(err);
        }
        callback(null, category);
    });
};

//一次获取所有信息
Category.getAllWithoutPage = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return categoryModel.find(filter).exec();
};

Category.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return categoryModel.findOne(filter);
};

Category.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return categoryModel.find(filter);
};