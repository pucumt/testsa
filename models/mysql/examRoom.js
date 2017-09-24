// 考场教室布置

const db = require('../../db'),
    config = require('../../settings');

const ExamRoom = db.defineModel('examRooms', {
    examId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = ExamRoom;
// classRooms 教室，因为没有使用这个功能，暂时不处理

ExamRoom.getFilter = function (filter) {
    filter.isDeleted = false;
    return ExamRoom.findOne({
        'where': filter
    });
};

ExamRoom.getFilters = function (filter) {
    filter.isDeleted = false;
    return ExamRoom.findAll({
        'where': filter
    });
};

ExamRoom.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ExamRoom.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};