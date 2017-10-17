// 考试类别，用来定义同一类考试只能报名一次

const db = require('../../db'),
    config = require('../../settings');

const ExamCategory = db.defineModel('examCategorys', {
    name: {
        type: db.STRING(50)
    }
});
module.exports = ExamCategory;

//读取用户信息
ExamCategory.getFilter = function (filter) {
    filter.isDeleted = false;
    return ExamCategory.findOne({
        'where': filter
    });
};

ExamCategory.getFilters = function (filter) {
    filter.isDeleted = false;
    return ExamCategory.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

ExamCategory.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ExamCategory.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};