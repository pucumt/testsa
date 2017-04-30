var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var couponSchema = new mongoose.Schema({
    name: String,
    category: String,
    couponStartDate: Date,
    couponEndDate: Date,
    gradeId: String,
    gradeName: String,
    subjectId: String,
    subjectName: String,
    reducePrice: Number,
    reduceMax: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isDeleted: Boolean
}, {
    collection: 'coupons'
});

var couponModel = mongoose.model('coupon', couponSchema);

function Coupon(option) {
    this.option = option;
};

module.exports = Coupon;

//存储学区信息
Coupon.prototype.save = function(callback) {
    var newcoupon = new couponModel(this.option);

    newcoupon.save(function(err, coupon) {
        if (err) {
            return callback(err);
        }
        callback(null, coupon);

        //db.close();
    });
};

Coupon.prototype.update = function(id, callback) {
    couponModel.update({
        _id: id
    }, this.option).exec(function(err, coupon) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
Coupon.get = function(id) {
    //打开数据库
    return couponModel.findOne({ _id: id, isDeleted: { $ne: true } });
};

//一次获取20个学区信息
Coupon.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = couponModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, coupons) {
                callback(null, coupons, count);
            });
    });
};

//删除一个学区
Coupon.delete = function(id, callback) {
    couponModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, coupon) {
        if (err) {
            return callback(err);
        }
        callback(null, coupon);
    });
};

Coupon.getFilter = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return couponModel.findOne(filter);
};

Coupon.publish = function(id, callback) {
    couponModel.update({
        _id: id
    }, {
        isPublished: true
    }).exec(function(err, coupon) {
        if (err) {
            return callback(err);
        }
        callback(null, coupon);
    });
};

Coupon.unpublish = function(id, callback) {
    couponModel.update({
        _id: id
    }, {
        isPublished: false
    }).exec(function(err, coupon) {
        if (err) {
            return callback(err);
        }
        callback(null, coupon);
    });
};