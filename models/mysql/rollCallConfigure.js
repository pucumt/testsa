// 点名系统配置

const db = require('../../db'),
    config = require('../../settings');

const RollCallConfigure = db.defineModel('rollCallConfigures', {
    yearId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    yearName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = RollCallConfigure;

RollCallConfigure.getFilter = function (filter) {
    filter.isDeleted = false;
    return RollCallConfigure.findOne({
        'where': filter
    });
};

RollCallConfigure.getFilters = function (filter) {
    filter.isDeleted = false;
    return RollCallConfigure.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

RollCallConfigure.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return RollCallConfigure.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};