// 年级 科目 难度关系

const db = require('../../db'),
    config = require('../../settings');

const GradeSubjectCategoryRelation = db.defineModel('gradeSubjectCategoryRelations', {
    gradeSubjectId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    gradeId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    gradeName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subjectId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subjectName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    categoryId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    categoryName: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = GradeSubjectCategoryRelation;

GradeSubjectCategoryRelation.getFilter = function (filter) {
    filter.isDeleted = false;
    return GradeSubjectCategoryRelation.findOne({
        'where': filter
    });
};

GradeSubjectCategoryRelation.getFilters = function (filter) {
    filter.isDeleted = false;
    return GradeSubjectCategoryRelation.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

GradeSubjectCategoryRelation.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return GradeSubjectCategoryRelation.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};