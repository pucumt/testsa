// 课程对应的课本，可以设置起始和终止课

const db = require('../../db'),
    config = require('../../settings');

const PublicSchool = db.defineModel('publicSchools', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    },
    cityAreaId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    gradeId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = PublicSchool;

//读取用户信息
PublicSchool.getFilter = function (filter) {
    filter.isDeleted = false;
    return PublicSchool.findOne({
        'where': filter
    });
};

PublicSchool.getFilters = function (filter) {
    filter.isDeleted = false;
    return PublicSchool.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

PublicSchool.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return PublicSchool.findAndCountAll({
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