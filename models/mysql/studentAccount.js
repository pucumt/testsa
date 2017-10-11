// 账号，现在比较复杂，允许一个账号下有多个学生

const db = require('../../db'),
    config = require('../../settings');

const StudentAccount = db.defineModel('studentAccounts', {
    name: {
        type: db.STRING(20)
    },
    password: db.STRING(50),
    wechat: {
        type: db.STRING(100),
        defaultValue: ""
    }
});
module.exports = StudentAccount;

//读取用户信息
StudentAccount.getFilter = function (filter) {
    filter.isDeleted = false;
    return StudentAccount.findOne({
        'where': filter
    });
};

StudentAccount.getFilters = function (filter) {
    filter.isDeleted = false;
    return StudentAccount.findAll({
        'where': filter
    });
};

StudentAccount.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return StudentAccount.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};