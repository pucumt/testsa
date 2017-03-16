var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var schoolAreaSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    mobile: String,
    role: Number
}, {
    collection: 'schoolAreas'
});

var schoolAreaModel = mongoose.model('schoolArea', schoolAreaSchema);

function schoolArea(option) {
    this.option = option;
};

module.exports = schoolArea;

//存储用户信息
schoolArea.prototype.save = function(callback) {
    // var md5 = crypto.createHash('md5'),
    //     password_MD5 = md5.update(this.option.password.toLowerCase()).digest('hex');
    // //要存入数据库的用户信息文档
    // this.option.password = password_MD5;
    //打开数据库
    var newschoolArea = new schoolAreaModel(this.option);

    newschoolArea.save(function(err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);

        //db.close();
    });
};

schoolArea.prototype.update = function(callback) {
    // schoolAreaModel.findOne({ name: name }, function(err, schoolArea) {
    //     person.name = 'MDragon';
    //     var _id = person._id; //需要取出主键_id
    //     delete person._id; //再将其删除
    //     PersonModel.update({ _id: _id }, person, function(err) {});
    //     //此时才能用Model操作，否则报错
    // });
    schoolAreaModel.update({
        name: this.option.name
    }, this.option).exec(function(err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);
    });
};

//读取用户信息
schoolArea.get = function(name, callback) {
    //打开数据库
    schoolAreaModel.findOne({ name: name }, function(err, schoolArea) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolArea);

        //db.close();
    });
};

//一次获取20个用户信息
schoolArea.get20 = function(name, page, filter, callback) {
    var query = schoolAreaModel.count(filter);
    query.exec(function(err, count) {
        query.find().sort({
                _id: -1
            })
            .skip((page - 1) * 20)
            .limit(20)
            .exec(function(err, schoolAreas) {
                callback(null, schoolAreas, count);
            });
    });
};