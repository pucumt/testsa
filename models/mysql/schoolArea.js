// 校区，有好多校区，同时学生也会交叉，后续逻辑将会非常复杂（最好前台只能处理本校区事务）

const db = require('../../db'),
    config = require('../../settings');

const SchoolArea = db.defineModel('schoolAreas', {
    name: {
        type: db.STRING(20)
    },
    address: {
        type: db.STRING(100),
        defaultValue: ""
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = SchoolArea;

SchoolArea.getFilter = function (filter) {
    filter.isDeleted = false;
    return SchoolArea.findOne({
        'where': filter
    });
};

SchoolArea.getFilters = function (filter) {
    filter.isDeleted = false;
    return SchoolArea.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

SchoolArea.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SchoolArea.findAndCountAll({
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