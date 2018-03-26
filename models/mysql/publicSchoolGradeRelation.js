// 课程对应的课本，可以设置起始和终止课

const db = require('../../db'),
    config = require('../../settings');

const PublicSchoolGradeRelation = db.defineModel('publicSchoolGradeRelations', {
    publicSchoolId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    publicGradeId: {
        // 小学 初中
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = PublicSchoolGradeRelation;

//读取用户信息
PublicSchoolGradeRelation.getFilter = function (filter) {
    filter.isDeleted = false;
    return PublicSchoolGradeRelation.findOne({
        'where': filter
    });
};

PublicSchoolGradeRelation.getFilters = function (filter) {
    filter.isDeleted = false;
    return PublicSchoolGradeRelation.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

PublicSchoolGradeRelation.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return PublicSchoolGradeRelation.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};