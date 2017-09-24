// 开设的课程，属性比较多且目前在一个表里

const db = require('../../db'),
    config = require('../../settings');

const TrainClass = db.defineModel('trainClasss', {
    name: {
        type: db.STRING(50),
        defaultValue: ""
    },
    yearId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    yearName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    gradeId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    gradeName: {
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
    categoryId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    categoryName: {
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
    totalClassCount: {
        type: db.INTEGER,
        defaultValue: 0
    }, //共多少课时
    trainPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    },
    materialPrice: {
        type: db.DECIMAL,
        defaultValue: 0
    },
    teacherId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    teacherName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    attributeId: {
        type: db.STRING(50),
        defaultValue: ""
    }, //now used to check coupon, maybe change later
    attributeName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    courseStartDate: {
        type: db.DATE
    },
    courseEndDate: {
        type: db.DATE
    },
    courseTime: {
        type: db.STRING(50),
        defaultValue: ""
    },
    courseContent: {
        type: db.STRING(1000),
        defaultValue: ""
    },
    classRoomId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    classRoomName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    schoolId: {
        type: db.STRING(50),
        defaultValue: ""
    },
    schoolArea: {
        type: db.STRING(50),
        defaultValue: ""
    },
    isWeixin: {
        type: db.INTEGER,
        defaultValue: 0
    }, //0 new 1 publish 9 stop, 2 originalClass(now changed)
    isStop: {
        type: db.BOOLEAN,
        defaultValue: true
    },
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: true
    },
    isFull: {
        type: db.BOOLEAN,
        defaultValue: true
    },
    fromClassId: {
        type: db.STRING(50),
        defaultValue: ""
    }, //原班Id
    fromClassName: {
        type: db.STRING(50),
        defaultValue: ""
    },
    protectedDate: {
        type: db.DATE,
        allowNull: true
    }, //原班原报保护期，已经没有用了
    bookId: {
        type: db.STRING(50),
        defaultValue: ""
    }, //指定教材
    minLesson: {
        type: db.INTEGER,
        defaultValue: 0
    }, //指定开始课程
    maxLesson: {
        type: db.INTEGER,
        defaultValue: 0
    } //指定结束课程
});
module.exports = TrainClass;
// TBD 分数依赖部分比较复杂，需要重新处理


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
        'where': filter
    });
};

TrainClass.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return TrainClass.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};