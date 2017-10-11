// 学生课程的成绩

const db = require('../../db'),
    config = require('../../settings');

const StudentLessonScore = db.defineModel('studentLessonScores', {
    studentId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    lessonId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    contentId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    contentRecord: {
        type: db.STRING(50),
        defaultValue: ""
    }, //录音链接？？
    contentType: {
        type: db.INTEGER,
        defaultValue: 0
    }, //0 content 1 word 2 sentence
    score: {
        type: db.DECIMAL,
        defaultValue: 0
    }
});
module.exports = StudentLessonScore;

//读取用户信息
StudentLessonScore.getFilter = function (filter) {
    filter.isDeleted = false;
    return StudentLessonScore.findOne({
        'where': filter
    });
};

StudentLessonScore.getFilters = function (filter) {
    filter.isDeleted = false;
    return StudentLessonScore.findAll({
        'where': filter
    });
};

StudentLessonScore.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return StudentLessonScore.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};