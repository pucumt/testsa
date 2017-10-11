// 点名的课程

const db = require('../../db'),
    config = require('../../settings');

const AbsentClass = db.defineModel('absentClasss', {
    absentDate: {
        type: db.DATE,
        defaultValue: db.NOW
    },
    classId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    className: {
        type: db.STRING(50),
        defaultValue: ""
    },
    teacherId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    teacherName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    schoolId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    schoolName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    courseTime: {
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = AbsentClass;

//读取用户信息
AbsentClass.getFilter = function (filter) {
    filter.isDeleted = false;
    return AbsentClass.findOne({
        'where': filter
    });
};

AbsentClass.getFilters = function (filter) {
    filter.isDeleted = false;
    return AbsentClass.findAll({
        'where': filter
    });
};

AbsentClass.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AbsentClass.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};