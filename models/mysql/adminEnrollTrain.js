const db = require('../../db');

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
AdminEnrollTrain.get = function (name) {
    return User.findOne({
        'where': {
            'name': name
        }
    });
};

AdminEnrollTrain.save = function (option) {
    if (!option.yearId) {
        if (global.currentYear) {
            option.yearId = global.currentYear._id;
            option.yearName = global.currentYear.name;
        }
    }
    return AdminEnrollTrain.create(option);
};