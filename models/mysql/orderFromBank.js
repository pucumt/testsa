// 银行订单到系统处理

const db = require('../../db'),
    config = require('../../settings');

const OrderFromBank = db.defineModel('orderFromBanks', {
    orderDate: db.DATE,
    orderId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    machine: {
        type: db.STRING(50),
        defaultValue: ''
    }, // qr or online
    payType: {
        type: db.STRING(50),
        defaultValue: ''
    }, // zhifubao or weixin
    trainPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    }
});
module.exports = OrderFromBank;

OrderFromBank.getFilter = function (filter) {
    filter.isDeleted = false;
    return OrderFromBank.findOne({
        'where': filter
    });
};

OrderFromBank.getFilters = function (filter) {
    filter.isDeleted = false;
    return OrderFromBank.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

OrderFromBank.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OrderFromBank.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};