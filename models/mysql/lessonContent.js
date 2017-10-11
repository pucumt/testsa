// 年级 科目 难度关系

const db = require('../../db'),
    config = require('../../settings');

const LessonContent = db.defineModel('lessonContents', {
    name: {
        type: db.STRING(50),
        defaultValue: ''
    },
    lessonId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    contentType: {
        type: db.INTEGER,
        defaultValue: 0
    }, //0 content 1 word 2 sentence
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    duration: {
        type: db.INTEGER,
        defaultValue: 0
    } // 课文需要设置时间段，就是大概要录音多久
});
module.exports = LessonContent;

LessonContent.getFilter = function (filter) {
    filter.isDeleted = false;
    return LessonContent.findOne({
        'where': filter
    });
};

LessonContent.getFilters = function (filter) {
    filter.isDeleted = false;
    return LessonContent.findAll({
        'where': filter
    });
};

LessonContent.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return LessonContent.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};