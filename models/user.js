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
    var md5 = crypto.createHash('md5'),
        password_MD5 = md5.update(this.option.password.toLowerCase()).digest('hex');
    //要存入数据库的用户信息文档
    this.option.password = password_MD5;
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