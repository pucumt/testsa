// 年度，理想状态是只能处理本年度的事务，但是实际发现经常出现多年级事务交叉的情况

const db = require('../../db'),
    config = require('../../settings');

const Year = db.defineModel('years', {
    name: {
        type: db.STRING(20)
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    isCurrentYear: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = Year;

//读取用户信息
Year.getFilter = function (filter) {
    filter.isDeleted = false;
    return Year.findOne({
        'where': filter
    });
};

Year.getFilters = function (filter) {
    filter.isDeleted = false;
    return Year.findAll({
        'where': filter
    });
};

Year.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Year.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};