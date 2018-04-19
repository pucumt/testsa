// 课程依赖考试的关系表

const db = require('../../db'),
    config = require('../../settings');

const TrainClassExams = db.defineModel('trainClassExams', {
    trainClassId: {
        type: db.STRING(50)
    },
    examName: {
        type: db.STRING(50),
        defaultValue: ""
    }, // 选择的小类别
    minScore: {
        type: db.FLOAT,
        defaultValue: 0
    }, // 小类别的价格
    minCount: {
        type: db.INTEGER,
        defaultValue: 0
    } // 对应的名额数量
});
module.exports = TrainClassExams;

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
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

TrainClassExams.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return TrainClassExams.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};