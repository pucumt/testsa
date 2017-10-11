// 课程难度

const db = require('../../db'),
    config = require('../../settings');

const Category = db.defineModel('categorys', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    },
    grade: {
        type: db.INTEGER,
        defaultValue: 0
    } // 基础班0 培优班5 通中预备10 通中15。可以下调
});
module.exports = Category;

//读取用户信息
Category.getFilter = function (filter) {
    filter.isDeleted = false;
    return Category.findOne({
        'where': filter
    });
};

Category.getFilters = function (filter) {
    filter.isDeleted = false;
    return Category.findAll({
        'where': filter
    });
};

Category.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Category.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};