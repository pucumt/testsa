// 报名流程控制

const db = require('../../db'),
    config = require('../../settings');

const EnrollProcessConfigure = db.defineModel('enrollProcessConfigures', {
    newStudentStatus: {
        type: db.BOOLEAN,
        defaultValue: false
    }, //新生报名接口状态
    oldStudentStatus: {
        type: db.BOOLEAN,
        defaultValue: false
    }, //老生报名接口状态
    oldStudentSwitch: {
        type: db.BOOLEAN,
        defaultValue: false
    }, //老生调班接口状态
    isGradeUpgrade: {
        type: db.BOOLEAN,
        defaultValue: false
    }, //老生年级是否调整
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = EnrollProcessConfigure;

//读取用户信息
EnrollProcessConfigure.getFilter = function (filter) {
    filter.isDeleted = false;
    return EnrollProcessConfigure.findOne({
        'where': filter
    });
};

EnrollProcessConfigure.getFilters = function (filter) {
    filter.isDeleted = false;
    return EnrollProcessConfigure.findAll({
        'where': filter
    });
};

EnrollProcessConfigure.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return EnrollProcessConfigure.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};