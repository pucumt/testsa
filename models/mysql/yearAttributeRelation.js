// 年度和学期对应关系

const db = require('../../db'),
    config = require('../../settings');

const YearAttributeRelation = db.defineModel('yearAttributeRelations', {
    yearId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    yearName: {
        type: db.STRING(50),
        defaultValue: '' // no value
    },
    attributeId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    attributeName: {
        type: db.STRING(50),
        defaultValue: '' // no value
    }
});
module.exports = YearAttributeRelation;

YearAttributeRelation.getFilter = function (filter) {
    filter.isDeleted = false;
    return YearAttributeRelation.findOne({
        'where': filter
    });
};

YearAttributeRelation.getFilters = function (filter) {
    filter.isDeleted = false;
    return YearAttributeRelation.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

YearAttributeRelation.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return YearAttributeRelation.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};