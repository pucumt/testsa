const db = require('../../db'),
    config = require('../../settings');

const WeekType = db.defineModel('weekTypes', {
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
module.exports = WeekType;

//读取用户信息
WeekType.getFilter = function (filter) {
    filter.isDeleted = false;
    return WeekType.findOne({
        'where': filter
    });
};

WeekType.getFilters = function (filter) {
    filter.isDeleted = false;
    return WeekType.findAll({
        'where': filter
    });
};

WeekType.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return WeekType.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};