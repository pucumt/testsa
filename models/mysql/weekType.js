// 为了方便家长选课加入了星期几的这个选项，但是由于课程体系的混乱，使用起来还是比较复杂

const db = require('../../db'),
    config = require('../../settings');

const WeekType = db.defineModel('weekTypes', {
    name: {
        type: db.STRING(20)
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