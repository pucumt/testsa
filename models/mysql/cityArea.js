// 课程对应的课本，可以设置起始和终止课

const db = require('../../db'),
    config = require('../../settings');

const CityArea = db.defineModel('cityAreas', {
    name: {
        // 那些区
        type: db.STRING(50),
        defaultValue: ""
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = CityArea;

//读取用户信息
CityArea.getFilter = function (filter) {
    filter.isDeleted = false;
    return CityArea.findOne({
        'where': filter
    });
};

CityArea.getFilters = function (filter) {
    filter.isDeleted = false;
    return CityArea.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

CityArea.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return CityArea.findAndCountAll({
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