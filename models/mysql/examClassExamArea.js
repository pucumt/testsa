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
    }
});
module.exports = ExamClassExamArea;

ExamClassExamArea.getFilter = function (filter) {
    filter.isDeleted = false;
    return ExamClassExamArea.findOne({
        'where': filter
    });
};

ExamClassExamArea.getFilters = function (filter) {
    filter.isDeleted = false;
    return ExamClassExamArea.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

ExamClassExamArea.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ExamClassExamArea.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};