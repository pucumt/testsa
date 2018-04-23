// 旅游人的详细信息

const db = require('../../db'),
    config = require('../../settings');

const AdminEnrollTrainPeople = db.defineModel('adminEnrollTrainPeoples', {
    trainOrderId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    peopleType: {
        type: db.INTEGER,
        defaultValue: 0
    }, // 0 是学生 1 是家长
    schoolId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    schoolName: {
        type: db.STRING(50),
        defaultValue: ''
    }, // 便于统计信息
    gradeId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    gradeName: {
        type: db.STRING(50),
        defaultValue: ''
    } // 便于统计信息
});
module.exports = AdminEnrollTrainPeople;

//读取用户信息
AdminEnrollTrainPeople.getFilter = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollTrainPeople.findOne({
        'where': filter
    });
};

AdminEnrollTrainPeople.getFilters = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollTrainPeople.findAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ]
    });
};

AdminEnrollTrainPeople.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AdminEnrollTrainPeople.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};