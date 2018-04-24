// 课程订单，也是核心逻辑。改成关系数据库的话一些字段可以去掉

const db = require('../../db'),
    config = require('../../settings');

const AdminEnrollTrain = db.defineModel('adminEnrollTrains', {
    accountId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    trainId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    trainName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    totalPrice: {
        type: db.FLOAT,
        defaultValue: 0
    }, //实际培训费
    rebatePrice: {
        type: db.FLOAT,
        defaultValue: 0
    }, //退费
    isSucceed: {
        type: db.INTEGER,
        defaultValue: 1
    }, //1 succeed, 9 canceled and not calculate, 6 use soon, 7 canceled but calculate partial money
    cancelType: {
        type: db.INTEGER,
        defaultValue: 0
    }, //0 退课, 1 调课历史记录
    isPayed: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    payWay: {
        type: db.INTEGER,
        defaultValue: 0
    }, //0 cash 1 offline card 2 zhuanzhang 8 zhifubao 9 weixin 6 weixinOnline 7 zhifubaoOnline
    examId: {
        type: db.STRING(50),
        defaultValue: ''
    }, // the select option
    examName: {
        type: db.STRING(50),
        defaultValue: ''
    }, // the select option name
    peopleCount: {
        type: db.INTEGER,
        defaultValue: 0
    }, // the join person count
    comment: {
        type: db.STRING(100),
        defaultValue: ''
    },
    fromId: {
        type: db.STRING(50),
        defaultValue: ''
    }, //调班从哪里调过来
    baseId: {
        type: db.STRING(50),
        defaultValue: ''
    } //根订单（原始订单）
});
module.exports = AdminEnrollTrain;

//读取用户信息
AdminEnrollTrain.getFilter = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollTrain.findOne({
        'where': filter
    });
};

AdminEnrollTrain.getFilters = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollTrain.findAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ]
    });
};

AdminEnrollTrain.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AdminEnrollTrain.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id', 'DESC']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};

// 年度保存模块再看情况处理

// AdminEnrollTrain.save = function (option) {
//     if (!option.yearId) {
//         if (global.currentYear) {
//             option.yearId = global.currentYear._id;
//             option.yearName = global.currentYear.name;
//         }
//     }
//     return AdminEnrollTrain.create(option);
// };