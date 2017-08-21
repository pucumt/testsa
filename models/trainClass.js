var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var trainClassSchema = new mongoose.Schema({
    name: String,
    yearId: String,
    yearName: String,
    gradeId: String,
    gradeName: String,
    subjectId: String,
    subjectName: String,
    categoryId: String,
    categoryName: String,
    totalStudentCount: {
        type: Number,
        default: 0
    }, //招生人数
    enrollCount: {
        type: Number,
        default: 0
    }, //报名人数
    totalClassCount: {
        type: Number,
        default: 0
    }, //共多少课时
    trainPrice: {
        type: Number,
        default: 0
    },
    materialPrice: {
        type: Number,
        default: 0
    },
    teacherId: ObjectId,
    teacherName: String,
    attributeId: String, //now used to check coupon, maybe change later
    attributeName: String,
    courseStartDate: Date,
    courseEndDate: Date,
    courseTime: String,
    courseContent: String,
    classRoomId: String,
    classRoomName: String,
    schoolId: String,
    schoolArea: String,
    isWeixin: {
        type: Number,
        default: 0
    }, //0 new 1 publish 9 stop, 2 originalClass(now changed)
    isStop: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    exams: [{
        examId: String,
        examName: String,
        minScore: Number
    }],
    isFull: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    fromClassId: String, //原班Id
    fromClassName: String,
    protectedDate: Date, //原班原报保护期
    bookId: ObjectId
}, {
    collection: 'trainClasss'
});

var trainClassModel = mongoose.model('trainClass', trainClassSchema);

function TrainClass(option) {
    this.option = option;
};

module.exports = TrainClass;

//存储学区信息
TrainClass.prototype.save = function () {
    if (!this.option.isWeixin) {
        this.option.isWeixin = 0;
    }
    if (!this.option.enrollCount) {
        this.option.enrollCount = 0;
    }
    this.option.isFullOrder = false;
    var newtrainClass = new trainClassModel(this.option);

    return newtrainClass.save();
};

TrainClass.prototype.update = function (id) {
    return trainClassModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
TrainClass.get = function (id) {
    //打开数据库
    return trainClassModel.findOne({
        _id: id
    });
};

//一次获取20个学区信息
TrainClass.getAll = function (id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = {
            $ne: true
        };
    } else {
        filter = {
            isDeleted: {
                $ne: true
            }
        };
    }
    var query = trainClassModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, trainClasss) {
                callback(null, trainClasss, count);
            });
    });
};

//删除一个学区
TrainClass.delete = function (id, callback) {
    trainClassModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

//发布
TrainClass.publish = function (id, callback) {
    trainClassModel.update({
        _id: id
    }, {
        isWeixin: 1
    }).exec(function (err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

TrainClass.publishAll = function (ids, callback) {
    trainClassModel.update({
        _id: {
            $in: ids
        }
    }, {
        isWeixin: 1
    }, {
        multi: true
    }).exec(function (err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

//停用
TrainClass.unPublish = function (id, callback) {
    trainClassModel.update({
        _id: id
    }, {
        isWeixin: 9
    }).exec(function (err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

TrainClass.setToOriginal = function (id, callback) {
    trainClassModel.update({
        _id: id
    }, {
        isWeixin: 2
    }).exec(function (err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

TrainClass.unPublishAll = function (ids, callback) {
    trainClassModel.update({
        _id: {
            $in: ids
        }
    }, {
        isWeixin: 9
    }, {
        multi: true
    }).exec(function (err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

TrainClass.enroll = function (id) {
    return trainClassModel.findOne({
            _id: id,
            isDeleted: {
                $ne: true
            }
        })
        .then(function (exam) {
            return trainClassModel.update({
                _id: id,
                enrollCount: {
                    $lt: exam.totalStudentCount
                }
            }, {
                $inc: {
                    enrollCount: 1
                }
            }).exec();
        });
};

TrainClass.adminEnroll = function (id) {
    return trainClassModel.findOne({
            _id: id,
            isDeleted: {
                $ne: true
            }
        })
        .then(function (exam) {
            return trainClassModel.update({
                _id: id
            }, {
                $inc: {
                    enrollCount: 1
                }
            }).exec();
        });
};

TrainClass.full = function (id) {
    return trainClassModel.update({
        _id: id
    }, {
        isFull: true
    }).exec();
};

TrainClass.cancel = function (id) {
    return trainClassModel.findOne({
            _id: id,
            isDeleted: {
                $ne: true
            }
        })
        .then(function (exam) {
            return trainClassModel.update({
                _id: id
            }, {
                $inc: {
                    enrollCount: -1
                },
                isFull: false
            }).exec();
        });
};

//一次获取20个学区信息
TrainClass.getAllToEnroll = function (id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = {
            $ne: true
        };
    } else {
        filter = {
            isDeleted: {
                $ne: true
            }
        };
    }
    filter.$where = "this.enrollCount < this.totalStudentCount";
    var query = trainClassModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, trainClasss) {
                callback(null, trainClasss, count);
            });
    });
};

TrainClass.getAllToOriginalEnroll = function (id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = {
            $ne: true
        };
    } else {
        filter = {
            isDeleted: {
                $ne: true
            }
        };
    }
    filter.$where = "this.enrollCount < this.totalStudentCount";
    var query = trainClassModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, trainClasss) {
                callback(null, trainClasss, count);
            });
    });
};

TrainClass.getFilter = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return trainClassModel.findOne(filter);
};

TrainClass.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return trainClassModel.find(filter);
};

TrainClass.filtersToEnroll = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    filter.$where = "this.enrollCount < this.totalStudentCount";
    return trainClassModel.find(filter);
};

TrainClass.deleteAll = function (ids) {
    return trainClassModel.update({
        _id: {
            $in: ids
        }
    }, {
        isDeleted: true
    }, {
        multi: true
    }).exec();
};

TrainClass.publishWithYear = function (id) {
    return trainClassModel.update({
        yearId: id,
        isDeleted: {
            $ne: true
        }
    }, {
        isWeixin: 1
    }, {
        multi: true
    }).exec();
};

TrainClass.unpublishWithYear = function (id) {
    return trainClassModel.update({
        yearId: id,
        isDeleted: {
            $ne: true
        }
    }, {
        isWeixin: 9
    }, {
        multi: true
    }).exec();
};

TrainClass.add100 = function (filter) {
    filter.isDeleted = {
        $ne: true
    };
    return trainClassModel.update(filter, {
        $inc: {
            trainPrice: 100
        }
    }, {
        multi: true
    }).exec();
};

TrainClass.min100 = function (id) {
    filter.isDeleted = {
        $ne: true
    };
    return trainClassModel.update(filter, {
        $inc: {
            trainPrice: -100
        }
    }, {
        multi: true
    }).exec();
};