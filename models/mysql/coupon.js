// 优惠券，最好少使用，因为容易出错

const db = require('../../db'),
    config = require('../../settings');

const Coupon = db.defineModel('coupons', {
    name: {
        type: db.STRING(50)
    },
    category: {
        type: db.STRING(50),
        defaultValue: ''
    },
    categoryName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    couponStartDate: {
        type: db.DATE
    },
    couponEndDate: {
        type: db.DATE
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
    reduceMax: {
        type: db.DECIMAL,
        defaultValue: 0
    }, // 随机优惠券的额度
    isPublished: {
        type: db.BOOLEAN,
        defaultValue: false
    } // 只有发布了的优惠券才能使用
});
module.exports = Coupon;

//读取用户信息
Coupon.getFilter = function (filter) {
    filter.isDeleted = false;
    return Coupon.findOne({
        'where': filter
    });
};

Coupon.getFilters = function (filter) {
    filter.isDeleted = false;
    return Coupon.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

Coupon.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Coupon.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};