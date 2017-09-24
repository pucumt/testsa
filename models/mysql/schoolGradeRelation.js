// 校区和年级对应关系

const db = require('../../db'),
    config = require('../../settings');

const SchoolGradeRelation = db.defineModel('schoolGradeRelations', {
    schoolId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    schoolArea: {
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
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = SchoolGradeRelation;

SchoolGradeRelation.getFilter = function (filter) {
    filter.isDeleted = false;
    return SchoolGradeRelation.findOne({
        'where': filter
    });
};

SchoolGradeRelation.getFilters = function (filter) {
    filter.isDeleted = false;
    return SchoolGradeRelation.findAll({
        'where': filter
    });
};

SchoolGradeRelation.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SchoolGradeRelation.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};