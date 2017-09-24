var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var couponAssignSchema = new mongoose.Schema({
    couponId: String,
    couponName: String,
    studentId: String,
    studentName: String,
    gradeId: String,
    gradeName: String,
    subjectId: String,
    subjectName: String,
    reducePrice: Number,
    couponStartDate: Date,
    couponEndDate: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    isExpired: {
        type: Boolean,
        default: false
    }, //useless now
    createdDate: {
        type: Date,
        default: Date.now
    },
    deletedDate: Date,
    deletedBy: String,
    createdBy: String,
    orderId: String //just used in train class now
}, {
    collection: 'couponAssigns'
});

var couponAssignModel = mongoose.model('couponAssign', couponAssignSchema);

function CouponAssign(option) {
    this.option = option;
};

module.exports = CouponAssign;

//存储学区信息
CouponAssign.prototype.save = function () {
    var newcouponAssign = new couponAssignModel(this.option);
    return newcouponAssign.save();
};

CouponAssign.prototype.update = function (id, callback) {
    couponAssignModel.update({
        _id: id
    }, this.option).exec(function (err, couponAssign) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

CouponAssign.updateOrder = function (filter, option) {
    return couponAssignModel.update(filter, option).exec();
};

//读取学区信息
CouponAssign.get = function (id) {
    //打开数据库
    return couponAssignModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
CouponAssign.getAll = function (id, page, filter, callback) {
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
    var query = couponAssignModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, couponAssigns) {
                callback(null, couponAssigns, count);
            });
    });
};

//删除一个学区
CouponAssign.delete = function (id, userId, callback) {
    couponAssignModel.update({
        _id: id
    }, {
        isDeleted: true,
        deletedDate: new Date(),
        deletedBy: userId
    }).exec(function (err, couponAssign) {
        if (err) {
            return callback(err);
        }
        callback(null, couponAssign);
    });
};

CouponAssign.getFilter = function (filter) {
    filter.isDeleted = {
        $ne: true
    };
    //打开数据库
    return couponAssignModel.findOne(filter);
};

CouponAssign.getFilters = function (filter) {
    filter.isDeleted = {
        $ne: true
    };
    //打开数据库
    return couponAssignModel.find(filter);
};

CouponAssign.getAllWithoutPage = function (filter) {
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
    return couponAssignModel.find(filter)
        .exec();
};

CouponAssign.getAllStudentIdWithoutPage = function (filter, callback) {
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
    couponAssignModel.find(filter)
        .select({
            studentId: 1,
            _id: 0
        })
        .exec(function (err, couponAssigns) {
            callback(null, couponAssigns);
        });
};

CouponAssign.use = function (id, orderId) {
    return couponAssignModel.update({
        _id: id
    }, {
        isUsed: true,
        orderId: orderId
    }).exec();
};

CouponAssign.batchUpdate = function (filter, option) {
    return couponAssignModel.update(filter, option, {
        multi: true
    }).exec();
};

CouponAssign.rawAll = function () {
    return couponAssignModel.find();
};