var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var bookSchema = new mongoose.Schema({
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
    deletedDate: Date,
    sequence: {
        type: Number,
        default: 0
    }
}, {
    collection: 'books'
});

var bookModel = mongoose.model('book', bookSchema);

function Book(option) {
    this.option = option;
};

module.exports = Book;

//存储学区信息
Book.prototype.save = function () {
    var newbook = new bookModel(this.option);

    return newbook.save();
};

Book.prototype.update = function (id) {
    return bookModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
Book.get = function (id) {
    //打开数据库
    return bookModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
Book.getAll = function (id, page, filter, callback) {
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
    var query = bookModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, books) {
                callback(null, books, count);
            });
    });
};

//删除一个学区
Book.delete = function (id, user) {
    return bookModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedBy: user,
        deletedDate: new Date()
    }).exec();
};

Book.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return bookModel.findOne(filter);
};

Book.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return bookModel.find(filter);
};

Book.batchUpdate = function (filter, option) {
    //打开数据库
    return bookModel.update(filter, option, {
        multi: true
    }).exec();
};

Book.rawAll = function () {
    return bookModel.find();
};