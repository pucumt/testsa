// 年级 科目 难度关系

const db = require('../../db'),
    config = require('../../settings');

const SubjectCategoryPLevelRelation = db.defineModel('subjectCategoryPLevelRelations', {
    subjectId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    categoryId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    processLevel: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = SubjectCategoryPLevelRelation;

SubjectCategoryPLevelRelation.getFilter = function (filter) {
    filter.isDeleted = false;
    return SubjectCategoryPLevelRelation.findOne({
        'where': filter
    });
};

SubjectCategoryPLevelRelation.getFilters = function (filter) {
    filter.isDeleted = false;
    return SubjectCategoryPLevelRelation.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

SubjectCategoryPLevelRelation.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SubjectCategoryPLevelRelation.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};