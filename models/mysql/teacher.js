// 老师，基本比较稳定，每学期都有新进来的老师也离职的老师

const db = require('../../db'),
    config = require('../../settings');

const Teacher = db.defineModel('teachers', {
    name: {
        type: db.STRING(20)
    },
    mobile: {
        type: db.STRING(20),
        allowNull: true
    },
    engName: {
        type: db.STRING(20),
        defaultValue: ''
    },
    password: db.STRING(50),
    address: {
        type: db.STRING(100),
        defaultValue: ""
    },
    role: {
        type: db.INTEGER,
        defaultValue: 0
    } // 0 teacher, 1 team leader
});
module.exports = Teacher;

//读取用户信息
Teacher.getFilter = function (filter) {
    filter.isDeleted = false;
    return Teacher.findOne({
        'where': filter
    });
};

Teacher.getFilters = function (filter) {
    filter.isDeleted = false;
    return Teacher.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

Teacher.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Teacher.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};