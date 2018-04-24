// 开设的课程，属性比较多且目前在一个表里

const db = require('../../db'),
    config = require('../../settings');

const TrainClass = db.defineModel('trainClasss', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    },
    subjectId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    subjectName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    totalStudentCount: {
        type: db.INTEGER,
        defaultValue: 0
    }, //招生人数
    enrollCount: {
        type: db.INTEGER,
        defaultValue: 0
    }, //报名人数
    courseContent: {
        type: db.STRING(1000),
        defaultValue: ""
    },
    isWeixin: {
        type: db.INTEGER,
        defaultValue: 0
    }, // 0 new 1 publish 9 stop, 2 originalClass(now changed)
    isStop: {
        type: db.BOOLEAN,
        defaultValue: true
    }
});
module.exports = TrainClass;
// 分数依赖部分比较复杂，需要重新处理

//读取用户信息
TrainClass.getFilter = function (filter) {
    filter.isDeleted = false;
    return TrainClass.findOne({
        'where': filter
    });
};

TrainClass.getFilters = function (filter) {
    filter.isDeleted = false;
    return TrainClass.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

TrainClass.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return TrainClass.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate', 'DESC'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};