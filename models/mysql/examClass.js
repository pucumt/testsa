// 考试名称，需要设置考场和考试科目

const db = require('../../db'),
    config = require('../../settings');

const ExamClass = db.defineModel('examClasss', {
    name: {
        type: db.STRING(50),
        defaultValue: ''
    },
    address: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examDate: {
        type: db.DATE
    },
    examTime: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examCategoryId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examCategoryName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    courseContent: {
        type: db.STRING(1000),
        defaultValue: ''
    },
    examCount: {
        type: db.INTEGER,
        defaultValue: 0
    },
    enrollCount: {
        type: db.INTEGER,
        defaultValue: 0
    },
    isWeixin: {
        type: db.INTEGER,
        defaultValue: 0
    }, //0 new 1 publish 9 stop
    seatNumber: {
        type: db.INTEGER,
        defaultValue: 0
    },
    examAreaId: {
        type: db.STRING(50),
        defaultValue: ''
    }, //means old enroll
    examAreaName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    isScorePublished: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    examPrice: { // 报名费
        type: db.FLOAT,
        defaultValue: 0
    },
    enrollEndDate: {
        type: db.DATE
    }
});
module.exports = ExamClass;

// 科目信息应该放到另外一张表

ExamClass.getFilter = function (filter) {
    filter.isDeleted = false;
    return ExamClass.findOne({
        'where': filter
    });
};

ExamClass.getFilters = function (filter) {
    filter.isDeleted = false;
    return ExamClass.findAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id']
        ]
    });
};

ExamClass.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ExamClass.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};