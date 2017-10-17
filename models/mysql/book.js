// 课程对应的课本，可以设置起始和终止课

const db = require('../../db'),
    config = require('../../settings');

const Book = db.defineModel('books', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = Book;

//读取用户信息
Book.getFilter = function (filter) {
    filter.isDeleted = false;
    return Book.findOne({
        'where': filter
    });
};

Book.getFilters = function (filter) {
    filter.isDeleted = false;
    return Book.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Book.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Book.findAndCountAll({
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