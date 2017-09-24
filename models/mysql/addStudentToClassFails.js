// 批量添加学生的跟踪表，处理完后需要手动清空

const db = require('../../db'),
    config = require('../../settings');

const addStudentToClassFail = db.defineModel('addStudentToClassFails', {
    name: {
        type: db.STRING(50),
        defaultValue: ''
    },
    mobile: {
        type: db.STRING(50),
        defaultValue: ''
    },
    className: {
        type: db.STRING(50),
        defaultValue: ''
    },
    reason: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = addStudentToClassFail;

//读取用户信息
addStudentToClassFail.getFilter = function (filter) {
    filter.isDeleted = false;
    return addStudentToClassFail.findOne({
        'where': filter
    });
};

addStudentToClassFail.getFilters = function (filter) {
    filter.isDeleted = false;
    return addStudentToClassFail.findAll({
        'where': filter
    });
};

addStudentToClassFail.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return addStudentToClassFail.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};