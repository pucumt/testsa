const db = require('../../db'),
    config = require('../../settings');

const Year = db.defineModel('years', {
    name: {
        type: db.STRING(20)
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
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