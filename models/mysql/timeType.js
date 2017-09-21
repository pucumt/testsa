const db = require('../../db'),
    config = require('../../settings');

const TimeType = db.defineModel('timeTypes', {
    name: {
        type: db.STRING(20)
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    isChecked: {
        type: db.BOOLEAN,
        defaultValue: true
    }
});
module.exports = TimeType;

//读取用户信息
TimeType.getFilter = function (filter) {
    filter.isDeleted = false;
    return TimeType.findOne({
        'where': filter
    });
};

TimeType.getFilters = function (filter) {
    filter.isDeleted = false;
    return TimeType.findAll({
        'where': filter
    });
};

TimeType.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return TimeType.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};