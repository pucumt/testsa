// 历史数据，改成关系数据库也要保存一些原始数据，当日志来使用

const db = require('../../db'),
    config = require('../../settings');

const AdminEnrollExamHistory = db.defineModel('adminEnrollExamHistorys', {
    payWay: {
        type: db.INTEGER,
        defaultValue: 0
    }, //0 cash 1 offline card 2 zhuanzhang 8 zhifubao 9 weixin 6 weixinOnline 7 zhifubaoOnline
    comment: {
        type: db.STRING(100),
        defaultValue: ''
    },
    examOrderId: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = AdminEnrollExamHistory;

//读取用户信息
AdminEnrollExamHistory.getFilter = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollExamHistory.findOne({
        'where': filter
    });
};

AdminEnrollExamHistory.getFilters = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollExamHistory.findAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ]
    });
};

AdminEnrollExamHistory.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AdminEnrollExamHistory.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};

// 也要查看下具体逻辑，看看能不能去掉一些重复字段

// AdminEnrollExamHistory.save = function (option) {
//     if (!option.yearId) {
//         if (global.currentYear) {
//             option.yearId = global.currentYear._id;
//             option.yearName = global.currentYear.name;
//         }
//     }
//     return AdminEnrollExamHistory.create(option);
// };