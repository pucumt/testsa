var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var adminEnrollTrainSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    mobile: String, //useless
    trainId: String,
    trainName: String,
    trainPrice: { type: Number, default: 0 },
    materialPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 100 },
    totalPrice: { type: Number, default: 0 }, //实际培训费
    realMaterialPrice: { type: Number, default: 0 }, //实际教材费
    rebatePrice: { type: Number, default: 0 }, //退费
    isSucceed: { type: Number, default: 1 }, //1 succeed, 9 canceled
    isPayed: { type: Boolean, default: false },
    payWay: Number, //0 cash 1 offline card 2 zhuanzhang 8 zhifubao 9 weixin 6 weixinOnline 7 zhifubaoOnline
    isDeleted: { type: Boolean, default: false },
    attributeId: String, //now used to check coupon, maybe change later
    attributeName: String,
    orderDate: { type: Date, default: Date.now },
    cancelDate: Date,
    comment: String,
    fromId: String, //调班从哪里调过来
    yearId: String,
    yearName: String
}, {
    collection: 'adminEnrollTrains'
});

var adminEnrollTrainModel = mongoose.model('adminEnrollTrain', adminEnrollTrainSchema);

function AdminEnrollTrain(option) {
    this.option = option;
};

module.exports = AdminEnrollTrain;

//存储学区信息
AdminEnrollTrain.prototype.save = function() {
    this.option.orderDate = new Date();
    if (!this.option.rebatePrice) {
        this.option.rebatePrice = 0;
    }

    if (!this.option.isSucceed) {
        this.option.isSucceed = 1;
    }

    if (!this.option.yearId) {
        if (global.currentYear) {
            this.option.yearId = global.currentYear._id;
            this.option.yearName = global.currentYear.name;
        }
    }

    var newadminEnrollTrain = new adminEnrollTrainModel(this.option);
    return newadminEnrollTrain.save();
};

AdminEnrollTrain.prototype.update = function(id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, this.option).exec(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
AdminEnrollTrain.get = function(id) {
    //打开数据库
    return adminEnrollTrainModel.findOne({ _id: id });
};

//一次获取20个学区信息
AdminEnrollTrain.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = adminEnrollTrainModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, adminEnrollTrains) {
                callback(null, adminEnrollTrains, count);
            });
    });
};

AdminEnrollTrain.getAllOfStudent = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = adminEnrollTrainModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .select({ studentId: 1, studentName: 1 })
            .exec(function(err, adminEnrollTrains) {
                callback(null, adminEnrollTrains, count);
            });
    });
};

//删除一个学区
AdminEnrollTrain.delete = function(id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};

AdminEnrollTrain.getByStudentAndClass = function(studentId, trainId) {
    //打开数据库
    return adminEnrollTrainModel.findOne({ studentId: studentId, trainId: trainId, isSucceed: 1, isDeleted: { $ne: true } });
};

AdminEnrollTrain.cancel = function(id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9,
        cancelDate: new Date()
    }).exec(function(err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};

AdminEnrollTrain.rebate = function(id, price) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        $inc: { rebatePrice: price, totalPrice: -price }
    }).exec();
};

AdminEnrollTrain.changeClass = function(id) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9,
        cancelDate: new Date()
    }).exec();
};

AdminEnrollTrain.pay = function(id, payWay) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        isPayed: true,
        payWay: payWay
    }).exec();
};

AdminEnrollTrain.getFilter = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return adminEnrollTrainModel.findOne(filter)
        .exec();
};

AdminEnrollTrain.getFilters = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return adminEnrollTrainModel.find(filter)
        .exec();
};

AdminEnrollTrain.getCount = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return adminEnrollTrainModel.find(filter).count();
};

AdminEnrollTrain.getDistinctStudents = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
        filter.isSucceed = 1;
    } else {
        filter = { isDeleted: { $ne: true } };
        filter.isSucceed = 1;
    }
    return adminEnrollTrainModel.distinct("studentId", { isSucceed: 1, isDeleted: { $ne: true } });
};

AdminEnrollTrain.getSpecialFilters = function(filter) {
    return adminEnrollTrainModel.find(filter)
        .exec();
};

AdminEnrollTrain.updateyear = function(id, option) {
    return adminEnrollTrainModel.update({
        _id: id
    }, option).exec();
};

AdminEnrollTrain.updateUserInfo = function(filter, option) {
    //打开数据库
    return adminEnrollTrainModel.update(filter, option).exec();
};

AdminEnrollTrain.changePayway = function(id, payWay) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        payWay: payWay
    }).exec();
};

AdminEnrollTrain.get3ordersOfPeople = function(ids) {
    return adminEnrollTrainModel.aggregate({
            $match: {
                isDeleted: { $ne: true },
                trainId: { $in: ids },
                isSucceed: 1
            }
        })
        .group({
            _id: {
                studentId: "$studentId",
                studentName: "$studentName"
            },
            count: { $sum: 1 }
        })
        .match({ count: { $gt: 2 } })
        .exec();
};