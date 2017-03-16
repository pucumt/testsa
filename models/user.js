var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var userSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    mobile: String,
    role: Number
}, {
    collection: 'users'
});

var userModel = mongoose.model('User', userSchema);

function User(option) {
    this.option = option;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    //打开数据库
    var newUser = new userModel(this.option);

    newUser.save(function(err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);

        //db.close();
    });
};

User.prototype.update = function(callback) {
    userModel.update({
        name: this.option.name
    }, this.option).exec(function(err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    });
};

//读取用户信息
User.get = function(name, callback) {
    //打开数据库
    userModel.findOne({ name: name }, function(err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);

        //db.close();
    });
};

//一次获取所有用户信息
User.getAll = function(name, page, filter, callback) {
    var query = userModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .exec(function(err, users) {
                callback(null, users, count);
            });
    });
};

//删除一个用户
User.delete = function(name, callback) {
    userModel.remove({
        name: name
    }).exec(function(err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    });
};