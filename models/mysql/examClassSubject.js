// 考试和考场关联表

const db = require('../../db'),
    config = require('../../settings');

const ExamClassSubject = db.defineModel('examClassSubjects', {
    examId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subjectId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subjectName: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = ExamClassSubject;

ExamClassSubject.getFilter = function (filter) {
    filter.isDeleted = false;
    return ExamClassSubject.findOne({
        'where': filter
    });
};

ExamClassSubject.getFilters = function (filter) {
    filter.isDeleted = false;
    return ExamClassSubject.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

ExamClassSubject.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ExamClassSubject.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};