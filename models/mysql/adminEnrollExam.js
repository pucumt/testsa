// 考试订单，一般小升初必定考试，其他情况也多属于分班考试

const db = require('../../db'),
    config = require('../../settings');

const AdminEnrollExam = db.defineModel('adminEnrollExams', {
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
    },
    examId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examCategoryId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examCategoryName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    isSucceed: {
        type: db.INTEGER,
        defaultValue: 1
    }, // 1 succeed, 9 canceled 
    isPayed: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    payWay: {
        type: db.INTEGER,
        defaultValue: 0
    }, // 0 cash 1 offline card 8 online zhifubao 9 online weixin 
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    orderDate: {
        type: db.DATE,
        defaultValue: db.NOW
    }, // 订单日期
    CancelDate: {
        type: db.DATE,
        allowNull: true
    }, // 取消日期
    examAreaId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examAreaName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    createdBy: {
        type: db.STRING(50),
        defaultValue: ""
    },
    deletedBy: {
        type: db.STRING(50),
        defaultValue: ""
    },
    isHide: {
        type: db.BOOLEAN,
        defaultValue: false
    } // 隐报不占用名额
    // TBD 成绩最好单独放到一个表里，根据关系数据库的特点，数据逻辑都要修改
    // orderDate 和 CancelDate 一并处理掉？
    // 创建和删除的逻辑最好也增加下
});
module.exports = AdminEnrollExam;

//读取用户信息
AdminEnrollExam.getFilter = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollExam.findOne({
        'where': filter
    });
};

AdminEnrollExam.getFilters = function (filter) {
    filter.isDeleted = false;
    return AdminEnrollExam.findAll({
        'where': filter
    });
};

AdminEnrollExam.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return AdminEnrollExam.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};