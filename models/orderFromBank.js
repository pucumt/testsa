var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var orderFromBankSchema = new mongoose.Schema({
    orderDate: Date,
    orderId: String,
    machine: String, // qr or online
    payType: String, // zhifubao or weixin
    trainPrice: Number
}, {
    collection: 'orderFromBanks'
});

var orderFromBankModel = mongoose.model('orderFromBank', orderFromBankSchema);

function OrderFromBank(option) {
    this.option = option;
};

module.exports = OrderFromBank;

//存储学区信息
OrderFromBank.prototype.save = function () {
    var neworderFromBank = new orderFromBankModel(this.option);
    return neworderFromBank.save();
};

//读取学区信息
OrderFromBank.get = function (id) {
    //打开数据库
    return orderFromBankModel.findOne({
        _id: id
    });
};

//删除一个学区
OrderFromBank.delete = function (id) {
    return orderFromBankModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};

OrderFromBank.getFilter = function (filter) {
    return orderFromBankModel.findOne(filter)
        .exec();
};

OrderFromBank.getFilters = function (filter) {
    return orderFromBankModel.find(filter)
        .exec();
};

OrderFromBank.rawAll = function () {
    return orderFromBankModel.find();
};