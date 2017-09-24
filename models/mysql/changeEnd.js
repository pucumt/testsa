// 家长端调课截至日期

const db = require('../../db'),
    config = require('../../settings');

const ChangeEnd = db.defineModel('changeEnds', {
    endDate: {
        type: db.DATE
    }
});
module.exports = ChangeEnd;

//读取用户信息
ChangeEnd.getFilter = function (filter) {
    filter.isDeleted = false;
    return ChangeEnd.findOne({
        'where': filter
    });
};

ChangeEnd.getFilters = function (filter) {
    filter.isDeleted = false;
    return ChangeEnd.findAll({
        'where': filter
    });
};

ChangeEnd.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ChangeEnd.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};