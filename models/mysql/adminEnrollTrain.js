// 课程订单，也是核心逻辑。改成关系数据库的话一些字段可以去掉

const db = require('../../db'),
    config = require('../../settings');

const AdminEnrollTrain = db.defineModel('adminEnrollTrains', {
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
    superCategoryId: {
        type: db.STRING(50),
        defaultValue: ''
    }, //提升难度
    superCategoryName: {
        type: db.STRING(50),
        defaultValue: ''
    }, //提升难度
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    schoolId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    schoolArea: {
        type: db.STRING(50),
        defaultValue: ''
    }
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
        'where': filter
    });
};

AdminEnrollTrain.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AdminEnrollTrain.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};

// TBD 年度保存模块再看情况处理

// AdminEnrollTrain.save = function (option) {
//     if (!option.yearId) {
//         if (global.currentYear) {
//             option.yearId = global.currentYear._id;
//             option.yearName = global.currentYear.name;
//         }
//     }
//     return AdminEnrollTrain.create(option);
// };