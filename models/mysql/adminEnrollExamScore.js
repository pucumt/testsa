// 考试订单，一般小升初必定考试，其他情况也多属于分班考试

const db = require('../../db'),
    config = require('../../settings');

const AdminEnrollExamScore = db.defineModel('adminEnrollExamScores', {
    examOrderId: {
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
    },
    score: {
        type: db.FLOAT,
        defaultValue: 0
    },
    report: {
        type: db.STRING(100),
        defaultValue: ''
    },
    grade: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = AdminEnrollExamScore;

//读取用户信息
AdminEnrollExamScore.getFilter = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollExamScore.findOne({
        'where': filter
    });
};

AdminEnrollExamScore.getFilters = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollExamScore.findAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ]
    });
};

AdminEnrollExamScore.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AdminEnrollExamScore.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};