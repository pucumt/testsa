const db = require('../../db'),
    config = require('../../settings');

const ExamArea = db.defineModel('examAreas', {
    name: {
        type: db.STRING(50)
    },
    address: {
        type: db.STRING(100),
        defaultValue: ""
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = ExamArea;

//读取用户信息
ExamArea.getFilter = function (filter) {
    filter.isDeleted = false;
    return ExamArea.findOne({
        'where': filter
    });
};

ExamArea.getFilters = function (filter) {
    filter.isDeleted = false;
    return ExamArea.findAll({
        'where': filter
    });
};

ExamArea.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ExamArea.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};