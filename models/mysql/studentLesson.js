// 学生对应的课程进度

const db = require('../../db'),
    config = require('../../settings');

const StudentLesson = db.defineModel('studentLessons', {
    studentId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    lessonId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    wordProcess: {
        type: db.INTEGER,
        defaultValue: 0
    }, //单词进度
    wordAve: {
        type: db.FLOAT,
        defaultValue: 0
    }, //单词平均分
    sentProcess: {
        type: db.INTEGER,
        defaultValue: 0
    }, //句子进度
    sentAve: {
        type: db.FLOAT,
        defaultValue: 0
    }, //句子平均分
    paragraphAve: {
        type: db.FLOAT,
        defaultValue: 0
    } //课文平均分
});
module.exports = StudentLesson;

//读取用户信息
StudentLesson.getFilter = function (filter) {
    filter.isDeleted = false;
    return StudentLesson.findOne({
        'where': filter
    });
};

StudentLesson.getFilters = function (filter) {
    filter.isDeleted = false;
    return StudentLesson.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

StudentLesson.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return StudentLesson.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};