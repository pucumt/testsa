// 优惠券 使用范围

const db = require('../../db'),
    config = require('../../settings');

const CouponSubject = db.defineModel('couponSubjects', {
    CouponId: {
        type: db.STRING(50)
    },
    subjectId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subjectName: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = CouponSubject;

//读取用户信息
CouponSubject.getFilter = function (filter) {
    filter.isDeleted = false;
    return CouponSubject.findOne({
        'where': filter
    });
};

CouponSubject.getFilters = function (filter) {
    filter.isDeleted = false;
    return CouponSubject.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

CouponSubject.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return CouponSubject.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};