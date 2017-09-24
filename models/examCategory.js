var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var examCategorySchema = new mongoose.Schema({
    name: String,
    isDeleted: Boolean
}, {
    collection: 'examCategorys'
});

var examCategoryModel = mongoose.model('examCategory', examCategorySchema);

function ExamCategory(option) {
    this.option = option;
};

module.exports = ExamCategory;

//存储学区信息
ExamCategory.prototype.save = function (callback) {
    var newexamCategory = new examCategoryModel(this.option);

    newexamCategory.save(function (err, examCategory) {
        if (err) {
            return callback(err);
        }
        callback(null, examCategory);

        //db.close();
    });
};

ExamCategory.prototype.update = function (id, callback) {
    examCategoryModel.update({
        _id: id
    }, this.option).exec(function (err, examCategory) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ExamCategory.get = function (id, callback) {
    //打开数据库
    examCategoryModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    }, function (err, examCategory) {
        if (err) {
            return callback(err);
        }
        callback(null, examCategory);

        //db.close();
    });
};

//一次获取20个学区信息
ExamCategory.getAll = function (id, page, filter, callback) {
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
    var query = examCategoryModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, examCategorys) {
                callback(null, examCategorys, count);
            });
    });
};

//删除一个学区
ExamCategory.delete = function (id, callback) {
    examCategoryModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, examCategory) {
        if (err) {
            return callback(err);
        }
        callback(null, examCategory);
    });
};

//一次获取所有信息
ExamCategory.getAllWithoutPage = function (filter) {
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
    return examCategoryModel.find(filter).exec();
};

ExamCategory.rawAll = function () {
    return examCategoryModel.find();
};