// 每期培训都有小测验，需要录入每次小测验的成绩

const db = require('../../db'),
    config = require('../../settings');

const Quiz = db.defineModel('quizzes', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = Quiz;

//读取用户信息
Quiz.getFilter = function (filter) {
    filter.isDeleted = false;
    return Quiz.findOne({
        'where': filter
    });
};

Quiz.getFilters = function (filter) {
    filter.isDeleted = false;
    return Quiz.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Quiz.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Quiz.findAndCountAll({
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