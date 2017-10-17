// 年级，暑假比较特殊，学生的年级还没有升上来，但是所上的课程已经是下学期的课程了

const db = require('../../db'),
    config = require('../../settings');

const Grade = db.defineModel('grades', {
    name: {
        type: db.STRING(20)
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = Grade;

Grade.getFilter = function (filter) {
    filter.isDeleted = false;
    return Grade.findOne({
        'where': filter
    });
};

Grade.getFilters = function (filter) {
    filter.isDeleted = false;
    return Grade.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Grade.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Grade.findAndCountAll({
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