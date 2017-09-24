// 考试和考场关联表

const db = require('../../db'),
    config = require('../../settings');

const ExamClassExamArea = db.defineModel('examClassExamAreas', {
    examId: {
        type: db.STRING(50),
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
    examAreaId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examAreaName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = ExamClassExamArea;

// TBD 科目信息应该放到另外一张表

ExamClassExamArea.getFilter = function (filter) {
    filter.isDeleted = false;
    return ExamClassExamArea.findOne({
        'where': filter
    });
};

ExamClassExamArea.getFilters = function (filter) {
    filter.isDeleted = false;
    return ExamClassExamArea.findAll({
        'where': filter
    });
};

ExamClassExamArea.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ExamClassExamArea.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};