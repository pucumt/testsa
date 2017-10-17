// 点名缺席的学生

const db = require('../../db'),
    config = require('../../settings');

const AbsentStudents = db.defineModel('absentStudentss', {
    studentId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    studentName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    mobile: {
        type: db.STRING(50),
        defaultValue: ""
    },
    absentDate: {
        type: db.DATEONLY,
        defaultValue: db.NOW
    }, // 缺勤日期
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
    comment: {
        type: db.STRING(50),
        defaultValue: ""
    }, // 缺勤原因
    isCheck: {
        type: db.BOOLEAN,
        defaultValue: false
    }, // 是否处理过
    isExtra: {
        type: db.BOOLEAN,
        defaultValue: false
    } // 是否补课 目前没完成此功能
});
module.exports = AbsentStudents;

//读取用户信息
AbsentStudents.getFilter = function (filter) {
    filter.isDeleted = false;
    return AbsentStudents.findOne({
        'where': filter
    });
};

AbsentStudents.getFilters = function (filter) {
    filter.isDeleted = false;
    return AbsentStudents.findAll({
        'where': filter
    });
};

AbsentStudents.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AbsentStudents.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};