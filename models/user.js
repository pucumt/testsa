var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  mobile: String
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

  newUser.save(function (err, user) {
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
  userModel.findOne({name: name}, function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);

    //db.close();
  });
};

//一次获取十篇文章
User.get20 = function(name, page, filter, callback) {
    var query = userModel.count(filter);
    query.exec(function(err, count) {
        query.find().sort({
                _id: -1
            })
            .skip((page - 1) * 20)
            .limit(20)
            .exec(function(err, users) {
                callback(null, users, count);
            });
    });
};

//删除一篇文章
User.delete = function(id, callback) {
    userModel.remove({
        _id: id
    }).exec(function(err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    });
};

//获取一篇文章
User.getOne = function(id, callback) {
    //打开数据库
    userModel.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    });
};

//更新一篇文章及其相关信息
User.prototype.update = function(id, callback) {
  var md5 = crypto.createHash('md5'),
      password_MD5 = md5.update(this.option.password.toLowerCase()).digest('hex');
  //要存入数据库的用户信息文档
  this.option.password = password_MD5;
  //打开数据库
    userModel.update({
        _id: id
    }, this.option).exec(function(err, user) {
        if (err) {
            return callback(err);
        }
        callback(null, user);
    });
};
