// 课程依赖考试的关系表

const db = require('../../db'),
    config = require('../../settings');

const TrainClassExams = db.defineModel('trainClassExams', {
    trainClassId: {
        type: db.STRING(50)
    },
    examId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    examName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    minScore: {
        type: db.DECIMAL,
        defaultValue: 0
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    }
});
module.exports = TrainClassExams;
// TBD 分数依赖部分比较复杂，需要重新处理

//读取用户信息
TrainClassExams.getFilter = function (filter) {
    filter.isDeleted = false;
    return TrainClassExams.findOne({
        'where': filter
    });
};

TrainClassExams.getFilters = function (filter) {
    filter.isDeleted = false;
    return TrainClassExams.findAll({
        'where': filter
    });
};

TrainClassExams.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return TrainClassExams.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};