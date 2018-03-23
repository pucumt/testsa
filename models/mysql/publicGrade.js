// 课程对应的课本，可以设置起始和终止课

const db = require('../../db'),
    config = require('../../settings');

const PublicGrade = db.defineModel('publicGrades', {
    name: {
        // 小学 初中
        type: db.STRING(50),
        defaultValue: ""
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = PublicGrade;

//读取用户信息
PublicGrade.getFilter = function (filter) {
    filter.isDeleted = false;
    return PublicGrade.findOne({
        'where': filter
    });
};

PublicGrade.getFilters = function (filter) {
    filter.isDeleted = false;
    return PublicGrade.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

PublicGrade.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return PublicGrade.findAndCountAll({
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