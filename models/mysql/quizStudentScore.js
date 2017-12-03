// 每期培训都有小测验，需要录入每次小测验的成绩

const db = require('../../db'),
    config = require('../../settings');

const QuizStudentScore = db.defineModel('quizStudentScores', {
    subjectId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    studentId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    yearId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    score1: {
        type: db.FLOAT,
        defaultValue: 0
    },
    score2: {
        type: db.FLOAT,
        defaultValue: 0
    },
    score3: {
        type: db.FLOAT,
        defaultValue: 0
    },
    score4: {
        type: db.FLOAT,
        defaultValue: 0
    },
    score5: {
        type: db.FLOAT,
        defaultValue: 0
    }
});
module.exports = QuizStudentScore;

//读取用户信息
QuizStudentScore.getFilter = function (filter) {
    filter.isDeleted = false;
    return QuizStudentScore.findOne({
        'where': filter
    });
};

QuizStudentScore.getFilters = function (filter) {
    filter.isDeleted = false;
    return QuizStudentScore.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

QuizStudentScore.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return QuizStudentScore.findAndCountAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};