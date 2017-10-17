// 优惠券的分发，就是发到学生手里的优惠券

const db = require('../../db'),
    config = require('../../settings');

const CouponAssign = db.defineModel('couponAssigns', {
    couponId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    couponName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    studentId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    studentName: {
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
    subjectId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subjectName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    reducePrice: {
        type: db.DECIMAL,
        defaultValue: 0
    },
    couponStartDate: {
        type: db.DATE
    },
    couponEndDate: {
        type: db.DATE
    },
    isUsed: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    orderId: {
        type: db.STRING(50),
        defaultValue: ''
    } //just used in train class now
});
module.exports = CouponAssign;

//读取用户信息
CouponAssign.getFilter = function (filter) {
    filter.isDeleted = false;
    return CouponAssign.findOne({
        'where': filter
    });
};

CouponAssign.getFilters = function (filter) {
    filter.isDeleted = false;
    return CouponAssign.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

CouponAssign.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return CouponAssign.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};