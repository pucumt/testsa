// 教室号，跟学区有关系

const db = require('../../db'),
    config = require('../../settings');

const ClassRoom = db.defineModel('classRooms', {
    name: {
        type: db.STRING(20)
    },
    sCount: {
        type: db.INTEGER,
        defaultValue: 0
    },
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
module.exports = ClassRoom;

//读取用户信息
ClassRoom.getFilter = function (filter) {
    filter.isDeleted = false;
    return ClassRoom.findOne({
        'where': filter
    });
};

ClassRoom.getFilters = function (filter) {
    filter.isDeleted = false;
    return ClassRoom.findAll({
        'where': filter
    });
};

ClassRoom.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ClassRoom.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};