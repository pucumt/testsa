// 退款记录

const db = require('../../db'),
    config = require('../../settings');

const RebateEnrollTrain = db.defineModel('rebateEnrollTrains', {
    trainOrderId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    originalPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //原来价格
    originalMaterialPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //原来教材费价格
    rebateTotalPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //总退费
    rebatePrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //培训费退费
    rebateMaterialPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //教材费退费
    comment: {
        type: db.STRING(500),
        defaultValue: ''
    },
    rebateWay: {
        type: db.INTEGER,
        defaultValue: 0
    } //6在线 null/0 现金
});
module.exports = RebateEnrollTrain;

RebateEnrollTrain.getFilter = function (filter) {
    filter.isDeleted = false;
    return RebateEnrollTrain.findOne({
        'where': filter
    });
};

RebateEnrollTrain.getFilters = function (filter) {
    filter.isDeleted = false;
    return RebateEnrollTrain.findAll({
        'where': filter
    });
};

RebateEnrollTrain.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return RebateEnrollTrain.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};