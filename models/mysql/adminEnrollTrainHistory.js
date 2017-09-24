// 历史数据，改成关系数据库也要保存一些原始数据，当日志来使用

const db = require('../../db'),
    config = require('../../settings');

const AdminEnrollTrainHistory = db.defineModel('adminEnrollTrainHistorys', {
    studentId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    studentName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    mobile: {
        type: db.STRING(50),
        defaultValue: ''
    }, //useless
    trainId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    trainName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    trainPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    },
    materialPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    },
    discount: {
        type: db.DECIMAL,
        defaultValue: 100
    },
    totalPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //实际培训费
    realMaterialPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //实际教材费
    rebatePrice: {
        type: db.DECIMAL,
        defaultValue: 0
    }, //退费
    isSucceed: {
        type: db.INTEGER,
        defaultValue: 1
    }, //1 succeed, 9 canceled, 6 use soon
    isPayed: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    payWay: db.INTEGER, //0 cash 1 offline card 2 zhuanzhang 8 zhifubao 9 weixin 6 weixinOnline 7 zhifubaoOnline
    attributeId: {
        type: db.STRING(50),
        defaultValue: ''
    }, //now used to check coupon, maybe change later
    attributeName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    orderDate: {
        type: db.DATE,
        defaultValue: db.NOW
    },
    createdBy: {
        type: db.STRING(50),
        defaultValue: ''
    },
    cancelledBy: {
        type: db.STRING(50),
        defaultValue: ''
    },
    cancelDate: {
        type: db.DATE,
        allowNull: true
    },
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
    }, //根订单（原始订单）
    yearId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    yearName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    historyDate: {
        type: db.DATE,
        defaultValue: db.NOW
    },
    historyid: {
        type: db.STRING(50),
        defaultValue: ''
    },
    historyBy: {
        type: db.STRING(50),
        defaultValue: ''
    } // 谁添加的此历史
});
module.exports = AdminEnrollTrainHistory;

//读取用户信息
AdminEnrollTrainHistory.getFilter = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollTrainHistory.findOne({
        'where': filter
    });
};

AdminEnrollTrainHistory.getFilters = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollTrainHistory.findAll({
        'where': filter
    });
};

AdminEnrollTrainHistory.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AdminEnrollTrainHistory.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};

// TBD 也要查看下具体逻辑，看看能不能去掉一些重复字段

// AdminEnrollTrainHistory.save = function (option) {
//     if (!option.yearId) {
//         if (global.currentYear) {
//             option.yearId = global.currentYear._id;
//             option.yearName = global.currentYear.name;
//         }
//     }
//     return AdminEnrollTrainHistory.create(option);
// };