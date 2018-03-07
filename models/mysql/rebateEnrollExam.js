// 测试退款记录
const db = require('../../db'),
    config = require('../../settings');

const RebateEnrollExam = db.defineModel('rebateEnrollExams', {
    examOrderId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    originalPrice: {
        type: db.FLOAT,
        defaultValue: 0
    }, //原来价格
    rebatePrice: {
        type: db.FLOAT,
        defaultValue: 0
    }, //退费
    comment: {
        type: db.STRING(500),
        defaultValue: ''
    },
    rebateWay: {
        type: db.INTEGER,
        defaultValue: 0
    } //6在线 null/0 现金
});
module.exports = RebateEnrollExam;

RebateEnrollExam.getFilter = function (filter) {
    filter.isDeleted = false;
    return RebateEnrollExam.findOne({
        'where': filter
    });
};

RebateEnrollExam.getFilters = function (filter) {
    filter.isDeleted = false;
    return RebateEnrollExam.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

RebateEnrollExam.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return RebateEnrollExam.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};