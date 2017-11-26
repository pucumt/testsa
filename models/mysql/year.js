// 年度，理想状态是只能处理本年度的事务，但是实际发现经常出现多年级事务交叉的情况

const db = require('../../db'),
    config = require('../../settings');

const Year = db.defineModel('years', {
    name: {
        type: db.STRING(20)
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    isCurrentYear: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    calculateDate: {
        type: db.DATE,
        allowNull: true
    } // 结算日期，只处理结算日期内正常的数据。默认为空
});
module.exports = Year;

//读取用户信息
Year.getFilter = function (filter) {
    filter.isDeleted = false;
    return Year.findOne({
        'where': filter
    });
};

Year.getFilters = function (filter) {
    filter.isDeleted = false;
    return Year.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Year.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Year.findAndCountAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};