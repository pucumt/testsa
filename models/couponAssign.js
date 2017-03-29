var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var couponAssignSchema = new mongoose.Schema({
    couponId: String,
    couponName: String,
    studentId: String,
    gradeId: String,
    gradeName: String,
    subjectId: String,
    subjectName: String,
    reducePrice: Number,
    couponStartDate: Date,
    couponEndDate: Date,
    isDeleted: Boolean,
    isUsed: Boolean,
    isExpired: Boolean
}, {
    collection: 'couponAssigns'
});

var couponAssignModel = mongoose.model('couponAssign', couponAssignSchema);

function CouponAssign(option) {
    this.option = option;
};

module.exports = CouponAssign;

//存储学区信息
CouponAssign.prototype.save = function(callback) {
    var newcouponAssign = new couponAssignModel(this.option);

    newcouponAssign.save(function(err, couponAssign) {
        if (err) {
            return callback(err);
        }
        callback(null, couponAssign);

        //db.close();
    });
};

CouponAssign.prototype.update = function(id, callback) {
    couponAssignModel.update({
        _id: id
    }, this.option).exec(function(err, couponAssign) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
CouponAssign.get = function(id) {
    //打开数据库
    return couponAssignModel.findOne({ _id: id, isDeleted: { $ne: true } });
};

//一次获取20个学区信息
CouponAssign.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = couponAssignModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, couponAssigns) {
                callback(null, couponAssigns, count);
            });
    });
};

//删除一个学区
CouponAssign.delete = function(id, callback) {
    couponAssignModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, couponAssign) {
        if (err) {
            return callback(err);
        }
        callback(null, couponAssign);
    });
};

CouponAssign.getFlter = function(filter) {
    filter.isDeleted = { $ne: true };
    //打开数据库
    return couponAssignModel.findOne(filter);
};