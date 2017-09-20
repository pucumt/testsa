const db = require('../../db'),
    config = require('../../settings');

const SchoolArea = db.defineModel('schoolAreas', {
    name: {
        type: db.STRING(20)
    },
    address: {
        type: db.STRING(100),
        defaultValue: ""
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
module.exports = SchoolArea;

SchoolArea.getFilter = function (filter) {
    filter.isDeleted = false;
    return SchoolArea.findOne({
        'where': filter
    });
};

SchoolArea.getFilters = function (filter) {
    filter.isDeleted = false;
    return SchoolArea.findAll({
        'where': filter
    });
};

SchoolArea.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SchoolArea.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};