// 学生课程的成绩

const db = require('../../db'),
    config = require('../../settings');

const Subject = db.defineModel('subjects', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = Subject;

//读取用户信息
Subject.getFilter = function (filter) {
    filter.isDeleted = false;
    return Subject.findOne({
        'where': filter
    });
};

Subject.getFilters = function (filter) {
    filter.isDeleted = false;
    return Subject.findAll({
        'where': filter
    });
};

Subject.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Subject.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};