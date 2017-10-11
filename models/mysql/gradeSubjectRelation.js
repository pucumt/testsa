// 年级 科目 难度关系

const db = require('../../db'),
    config = require('../../settings');

const GradeSubjectRelation = db.defineModel('gradeSubjectRelations', {
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
    }
});
module.exports = GradeSubjectRelation;

GradeSubjectRelation.getFilter = function (filter) {
    filter.isDeleted = false;
    return GradeSubjectRelation.findOne({
        'where': filter
    });
};

GradeSubjectRelation.getFilters = function (filter) {
    filter.isDeleted = false;
    return GradeSubjectRelation.findAll({
        'where': filter
    });
};

GradeSubjectRelation.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return GradeSubjectRelation.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};