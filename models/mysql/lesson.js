// 年级 科目 难度关系

const db = require('../../db'),
    config = require('../../settings');

const Lesson = db.defineModel('lessons', {
    name: {
        type: db.STRING(50),
        defaultValue: ''
    },
    bookId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    bookName: {
        type: db.STRING(50),
        defaultValue: ''
    }, // useless
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = Lesson;

Lesson.getFilter = function (filter) {
    filter.isDeleted = false;
    return Lesson.findOne({
        'where': filter
    });
};

Lesson.getFilters = function (filter) {
    filter.isDeleted = false;
    return Lesson.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Lesson.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Lesson.findAndCountAll({
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