var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var adminEnrollTrainHistorySchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    mobile: String, //useless
    trainId: String,
    trainName: String,
    trainPrice: {
        type: Number,
        default: 0
    },
    materialPrice: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 100
    },
    totalPrice: {
        type: Number,
        default: 0
    }, //实际培训费
    realMaterialPrice: {
        type: Number,
        default: 0
    }, //实际教材费
    rebatePrice: {
        type: Number,
        default: 0
    }, //退费
    isSucceed: {
        type: Number,
        default: 1
    }, //1 succeed, 9 canceled
    isPayed: {
        type: Boolean,
        default: false
    },
    payWay: Number, //0 cash 1 offline card 2 zhuanzhang 8 zhifubao 9 weixin 6 weixinOnline 7 zhifubaoOnline
    isDeleted: {
        type: Boolean,
        default: false
    },
    attributeId: String, //now used to check coupon, maybe change later
    attributeName: String,
    orderDate: {
        type: Date,
        default: Date.now
    },
    cancelDate: Date,
    comment: String,
    fromId: String, //调班从哪里调过来
    yearId: String,
    yearName: String,

    historyDate: {
        type: Date,
        default: Date.now
    },
    historyid: String,
    createdBy: String
}, {
    collection: 'adminEnrollTrainHistorys'
});

var adminEnrollTrainHistoryModel = mongoose.model('adminEnrollTrainHistory', adminEnrollTrainHistorySchema);

function AdminEnrollTrainHistory(option) {
    this.option = option;
};

module.exports = AdminEnrollTrainHistory;

AdminEnrollTrainHistory.prototype.save = function () {
    var newadminEnrollTrainHistory = new adminEnrollTrainHistoryModel(this.option);
    return newadminEnrollTrainHistory.save();
};

AdminEnrollTrainHistory.prototype.update = function (id, callback) {
    return adminEnrollTrainHistoryModel.update({
        _id: id
    }, this.option).exec();
};

AdminEnrollTrainHistory.get = function (id) {
    //打开数据库
    return adminEnrollTrainHistoryModel.findOne({
        _id: id
    });
};

AdminEnrollTrainHistory.delete = function (id, callback) {
    return adminEnrollTrainHistoryModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};

AdminEnrollTrainHistory.rawAll = function () {
    return adminEnrollTrainHistoryModel.find();
};