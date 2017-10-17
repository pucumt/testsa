// 课程属性用于特殊的优惠，比如满三门课减多少钱

const db = require('../../db'),
    config = require('../../settings');

const ClassAttribute = db.defineModel('classAttributes', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = ClassAttribute;

//读取用户信息
ClassAttribute.getFilter = function (filter) {
    filter.isDeleted = false;
    return ClassAttribute.findOne({
        'where': filter
    });
};

ClassAttribute.getFilters = function (filter) {
    filter.isDeleted = false;
    return ClassAttribute.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

ClassAttribute.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ClassAttribute.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};