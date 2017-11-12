// 学生信息，归属于某个账号，但是家长可以随意改动，所以经常有问题

const db = require('../../db'),
    config = require('../../settings');

const StudentInfo = db.defineModel('studentInfos', {
    name: {
        type: db.STRING(50)
    },
    address: {
        type: db.STRING(100),
        defaultValue: ""
    },
    mobile: {
        type: db.STRING(20),
        allowNull: true
    },
    studentNo: {
        type: db.STRING(50),
        defaultValue: ""
    }, //学号
    School: {
        type: db.STRING(50),
        defaultValue: ""
    },
    className: {
        type: db.STRING(50),
        defaultValue: ""
    },
    sex: {
        type: db.BOOLEAN,
        defaultValue: false
    }, //0 男 1 女
    accountId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    discount: {
        type: db.FLOAT,
        defaultValue: 100
    }, // 原始购买打折(特价课程除外)
    gradeId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    gradeName: {
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = StudentInfo;

//读取用户信息
StudentInfo.getFilter = function (filter) {
    filter.isDeleted = false;
    return StudentInfo.findOne({
        'where': filter
    });
};

StudentInfo.getFilters = function (filter) {
    filter.isDeleted = false;
    return StudentInfo.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

StudentInfo.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return StudentInfo.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};