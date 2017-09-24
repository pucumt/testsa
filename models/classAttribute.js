var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var classAttributeSchema = new mongoose.Schema({
    name: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'classAttributes'
});

var classAttributeModel = mongoose.model('classAttribute', classAttributeSchema);

function ClassAttribute(option) {
    this.option = option;
};

module.exports = ClassAttribute;

//存储学区信息
ClassAttribute.prototype.save = function (callback) {
    var newclassAttribute = new classAttributeModel(this.option);

    newclassAttribute.save(function (err, classAttribute) {
        if (err) {
            return callback(err);
        }
        callback(null, classAttribute);

        //db.close();
    });
};

ClassAttribute.prototype.update = function (id, callback) {
    classAttributeModel.update({
        _id: id
    }, this.option).exec(function (err, classAttribute) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
ClassAttribute.get = function (id) {
    //打开数据库
    return classAttributeModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
ClassAttribute.getAll = function (id, page, filter, callback) {
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
    var query = classAttributeModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, classAttributes) {
                callback(null, classAttributes, count);
            });
    });
};

//删除一个学区
ClassAttribute.delete = function (id, callback) {
    classAttributeModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, classAttribute) {
        if (err) {
            return callback(err);
        }
        callback(null, classAttribute);
    });
};

ClassAttribute.getAllWithoutPage = function (filter) {
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

    return classAttributeModel.find(filter).exec();
};

ClassAttribute.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return classAttributeModel.findOne(filter);
};

ClassAttribute.rawAll = function () {
    return classAttributeModel.find();
};