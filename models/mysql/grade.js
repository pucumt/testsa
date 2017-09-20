const db = require('../../db'),
    config = require('../../settings');

const Grade = db.defineModel('grades', {
    name: {
        type: db.STRING(20),
        unique: true
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = Grade;

Grade.getFilter = function (filter) {
    filter.isDeleted = false;
    return Grade.findOne({
        'where': filter
    });
};

Grade.getFilters = function (filter) {
    filter.isDeleted = false;
    return Grade.findAll({
        'where': filter
    });
};

Grade.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Grade.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};