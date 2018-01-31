// 系统配置
// 1. 微信签名配置

const db = require('../../db'),
    config = require('../../settings');

const SystemConfigure = db.defineModel('systemConfigures', {
    key: {
        type: db.STRING(50),
        defaultValue: ''
    },
    value: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = SystemConfigure;

SystemConfigure.getFilter = function (filter) {
    filter.isDeleted = false;
    return SystemConfigure.findOne({
        'where': filter
    });
};

SystemConfigure.getFilters = function (filter) {
    filter.isDeleted = false;
    return SystemConfigure.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

SystemConfigure.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SystemConfigure.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};