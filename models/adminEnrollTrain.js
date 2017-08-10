var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var adminEnrollTrainSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    mobile: String, //useless
    trainId: ObjectId,
    trainName: String,
    trainPrice: {
        type: Number,
        default: 0
    },
    materialPrice: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 100
    },
    totalPrice: {
        type: Number,
        default: 0
    }, //实际培训费
    realMaterialPrice: {
        type: Number,
        default: 0
    }, //实际教材费
    rebatePrice: {
        type: Number,
        default: 0
    }, //退费
    isSucceed: {
        type: Number,
        default: 1
    }, //1 succeed, 9 canceled, 6 use soon
    isPayed: {
        type: Boolean,
        default: false
    },
    payWay: Number, //0 cash 1 offline card 2 zhuanzhang 8 zhifubao 9 weixin 6 weixinOnline 7 zhifubaoOnline
    isDeleted: {
        type: Boolean,
        default: false
    },
    attributeId: String, //now used to check coupon, maybe change later
    attributeName: String,
    orderDate: {
        type: Date,
        default: Date.now
    },
    createdBy: String,
    cancelledBy: String,
    cancelDate: Date,
    comment: String,
    fromId: String, //调班从哪里调过来
    baseId: ObjectId, //根订单（原始订单）
    yearId: String,
    yearName: String,
    superCategoryId: ObjectId, //提升难度
    superCategoryName: String, //提升难度
    schoolId: String,
    schoolArea: String
}, {
    collection: 'adminEnrollTrains'
});

var adminEnrollTrainModel = mongoose.model('adminEnrollTrain', adminEnrollTrainSchema);

function AdminEnrollTrain(option) {
    this.option = option;
};

module.exports = AdminEnrollTrain;

//存储学区信息
AdminEnrollTrain.prototype.save = function () {
    this.option.orderDate = new Date();
    if (!this.option.rebatePrice) {
        this.option.rebatePrice = 0;
    }

    if (!this.option.isSucceed) {
        this.option.isSucceed = 1;
    }

    if (!this.option.yearId) {
        if (global.currentYear) {
            this.option.yearId = global.currentYear._id;
            this.option.yearName = global.currentYear.name;
        }
    }

    var newadminEnrollTrain = new adminEnrollTrainModel(this.option);
    return newadminEnrollTrain.save();
};

AdminEnrollTrain.prototype.update = function (id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, this.option).exec(function (err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
AdminEnrollTrain.get = function (id) {
    //打开数据库
    return adminEnrollTrainModel.findOne({
        _id: id
    });
};

//一次获取20个学区信息
AdminEnrollTrain.getAll = function (id, page, filter, callback) {
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
    var query = adminEnrollTrainModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .sort({
                _id: -1
            })
            .limit(14)
            .exec(function (err, adminEnrollTrains) {
                callback(null, adminEnrollTrains, count);
            });
    });
};

AdminEnrollTrain.getAllOfStudent = function (id, page, filter, callback) {
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
    var query = adminEnrollTrainModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .select({
                studentId: 1,
                studentName: 1,
                mobile: 1
            })
            .exec(function (err, adminEnrollTrains) {
                callback(null, adminEnrollTrains, count);
            });
    });
};

//删除一个学区
AdminEnrollTrain.delete = function (id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function (err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};

AdminEnrollTrain.getByStudentAndClass = function (studentId, trainId) {
    //打开数据库
    return adminEnrollTrainModel.findOne({
        studentId: studentId,
        trainId: trainId,
        isSucceed: 1,
        isDeleted: {
            $ne: true
        }
    });
};

// cancelled function, now disposed
// AdminEnrollTrain.cancel = function (id, callback) {
//     adminEnrollTrainModel.update({
//         _id: id
//     }, {
//         isSucceed: 9,
//         cancelDate: new Date()
//     }).exec(function (err, adminEnrollTrain) {
//         if (err) {
//             return callback(err);
//         }
//         callback(null, adminEnrollTrain);
//     });
// };

AdminEnrollTrain.cancel = function (id, cancelledBy, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9,
        cancelledBy: cancelledBy,
        cancelDate: new Date()
    }).exec(function (err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};

AdminEnrollTrain.preSave = function (id, callback) {
    adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 6, //presave
        cancelDate: new Date()
    }).exec(function (err, adminEnrollTrain) {
        if (err) {
            return callback(err);
        }
        callback(null, adminEnrollTrain);
    });
};

AdminEnrollTrain.rebate = function (id, price, materialPrice, comment) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        $inc: {
            rebatePrice: price + materialPrice,
            realMaterialPrice: -materialPrice,
            totalPrice: -price
        },
        comment: comment
    }).exec();
};

AdminEnrollTrain.changeClass = function (id) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9,
        cancelDate: new Date()
    }).exec();
};

AdminEnrollTrain.pay = function (id, payWay) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        isPayed: true,
        payWay: payWay
    }).exec();
};

AdminEnrollTrain.getFilter = function (filter) {
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
    return adminEnrollTrainModel.findOne(filter)
        .exec();
};

AdminEnrollTrain.getFilters = function (filter) {
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
    return adminEnrollTrainModel.find(filter)
        .exec();
};

AdminEnrollTrain.getFiltersWithClass = function (filter) {
    return adminEnrollTrainModel.aggregate({
            $match: filter
        })
        .lookup({
            from: "trainClasss",
            localField: "trainId",
            foreignField: "_id",
            as: "trainClasss"
        })
        .exec();
};

AdminEnrollTrain.getFiltersWithClassFilters = function (filter, classFilters) {
    return adminEnrollTrainModel.aggregate({
            $match: filter
        })
        .lookup({
            from: "trainClasss",
            localField: "trainId",
            foreignField: "_id",
            as: "trainClasss"
        })
        .match(classFilters)
        .exec();
};

AdminEnrollTrain.getCount = function (filter) {
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
    return adminEnrollTrainModel.find(filter).count();
};

AdminEnrollTrain.getDistinctStudents = function (filter) {
    if (filter) {
        filter.isDeleted = {
            $ne: true
        };
        filter.isSucceed = 1;
    } else {
        filter = {
            isDeleted: {
                $ne: true
            }
        };
        filter.isSucceed = 1;
    }
    return adminEnrollTrainModel.distinct("studentId", {
        isSucceed: 1,
        isDeleted: {
            $ne: true
        }
    });
};

AdminEnrollTrain.getSpecialFilters = function (filter) {
    return adminEnrollTrainModel.find(filter)
        .exec();
};

AdminEnrollTrain.updateyear = function (id, option) {
    return adminEnrollTrainModel.update({
        _id: id
    }, option).exec();
};

AdminEnrollTrain.updateUserInfo = function (filter, option) {
    //打开数据库
    return adminEnrollTrainModel.update(filter, option, {
        multi: true
    }).exec();
};

AdminEnrollTrain.changePayway = function (id, payWay) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        payWay: payWay
    }).exec();
};

AdminEnrollTrain.get3ordersOfPeople = function (yearId, gradeId) {
    return adminEnrollTrainModel.aggregate({
            $match: {
                isDeleted: {
                    $ne: true
                },
                isSucceed: 1,
                yearId: yearId.toJSON()
            }
        })
        .lookup({
            from: "trainClasss",
            localField: "trainId",
            foreignField: "_id",
            as: "trainClasss"
        })
        .match({
            "trainClasss.gradeId": gradeId
        })
        .group({
            _id: {
                studentId: "$studentId",
                studentName: "$studentName"
            },
            count: {
                $sum: 1
            }
        })
        .match({
            count: {
                $gt: 2
            }
        })
        .exec();
};

function getAggQuery(yearId, gradeId, schoolId) {
    var aggQuery = adminEnrollTrainModel.aggregate({
            $match: {
                isDeleted: {
                    $ne: true
                },
                isSucceed: 1,
                yearId: yearId.toJSON()
            }
        })
        .lookup({
            from: "trainClasss",
            localField: "trainId",
            foreignField: "_id",
            as: "trainClasss"
        });

    var filter = {};
    if (gradeId) {
        filter["trainClasss.gradeId"] = gradeId;
    }
    if (schoolId) {
        filter["trainClasss.schoolId"] = schoolId;
    }
    return aggQuery.match(filter);
};

AdminEnrollTrain.getOrderCount = function (yearId, gradeId, schoolId) {
    var result = {},
        pArray = [];

    var p0 = getAggQuery(yearId, gradeId, schoolId).group({
            _id: null,
            count: {
                $sum: 1
            }
        }).exec()
        .then(function (obj) {
            result.totalCount = obj[0] && obj[0].count;
        });
    pArray.push(p0);

    var p1 = getAggQuery(yearId, gradeId, schoolId).group({
            _id: "$studentId"
        }).group({
            _id: null,
            count: {
                $sum: 1
            }
        })
        .exec()
        .then(function (obj) {
            result.peopleCount = obj[0] && obj[0].count;
        });
    pArray.push(p1);

    var p2 = getAggQuery(yearId, gradeId, schoolId).group({
            _id: "$studentId",
            count: {
                $sum: 1
            }
        })
        .match({
            count: 2
        })
        .group({
            _id: null,
            count: {
                $sum: 1
            }
        })
        .exec()
        .then(function (obj) {
            result.twoOrderCount = obj[0] && obj[0].count;
        });
    pArray.push(p2);

    var p3 = getAggQuery(yearId, gradeId, schoolId).group({
            _id: "$studentId",
            count: {
                $sum: 1
            }
        })
        .match({
            count: 3
        })
        .group({
            _id: null,
            count: {
                $sum: 1
            }
        })
        .exec()
        .then(function (obj) {
            result.threeOrderCount = obj[0] && obj[0].count;
        });
    pArray.push(p3);

    var p4 = getAggQuery(yearId, gradeId, schoolId).group({
            _id: "$studentId",
            count: {
                $sum: 1
            }
        })
        .match({
            count: {
                $gt: 3
            }
        })
        .group({
            _id: null,
            count: {
                $sum: 1
            }
        })
        .exec()
        .then(function (obj) {
            result.fourOrMoreCount = obj[0] && obj[0].count;
        });
    pArray.push(p4);

    return Promise.all(pArray).then(function () {
        return result;
    });
};

AdminEnrollTrain.changeTrainId = function (order) {
    return adminEnrollTrainModel.update({
        _id: order._id
    }, {
        trainId: order.trainId
    }).exec();
};

AdminEnrollTrain.getSchoolReportList = function (yearId, startDate, endDate) {
    return adminEnrollTrainModel.aggregate({
            $match: {
                isDeleted: {
                    $ne: true
                },
                isSucceed: 1,
                yearId: yearId.toJSON(),
                orderDate: {
                    $gte: (new Date(startDate)),
                    $lte: (new Date(endDate))
                } //, $gte: startDate //$gte: (new Date(startDate)) //$lte: (new Date(endDate))
            }
        })
        .lookup({
            from: "trainClasss",
            localField: "trainId",
            foreignField: "_id",
            as: "trainClasss"
        })
        .group({
            _id: {
                schoolId: "$trainClasss.schoolId",
                schoolArea: "$trainClasss.schoolArea"
            },
            trainPrice: {
                $sum: "$totalPrice"
            },
            materialPrice: {
                $sum: "$realMaterialPrice"
            }
        })
        .exec();
};

AdminEnrollTrain.getPayWayReportList = function (yearId, startDate, endDate, schoolId) {
    var aggQuery = adminEnrollTrainModel.aggregate({
            $match: {
                isDeleted: {
                    $ne: true
                },
                isSucceed: 1,
                yearId: yearId.toJSON(),
                orderDate: {
                    $gte: (new Date(startDate)),
                    $lte: (new Date(endDate))
                }
            }
        })
        .lookup({
            from: "trainClasss",
            localField: "trainId",
            foreignField: "_id",
            as: "trainClasss"
        });
    if (schoolId) {
        aggQuery = aggQuery.match({
            "trainClasss.schoolId": schoolId
        });
    }
    return aggQuery.group({
            _id: "$payWay",
            trainPrice: {
                $sum: "$totalPrice"
            },
            materialPrice: {
                $sum: "$realMaterialPrice"
            }
        })
        .exec();
};

AdminEnrollTrain.getCountOfStudentSubject = function (yearId, subjectId, studentIds) {
    return adminEnrollTrainModel.aggregate({
            $match: {
                isDeleted: {
                    $ne: true
                },
                isSucceed: 1,
                yearId: yearId.toJSON(),
                studentId: {
                    $in: studentIds
                }
            }
        })
        .lookup({
            from: "trainClasss",
            localField: "trainId",
            foreignField: "_id",
            as: "trainClasss"
        })
        .match({
            "trainClasss.subjectId": subjectId
        })
        .group({
            _id: null,
            count: {
                $sum: 1
            },
        })
        .exec();
};

AdminEnrollTrain.singleUpdate = function (filter, option) {
    //打开数据库
    return adminEnrollTrainModel.update(filter, option).exec();
};

AdminEnrollTrain.batchUpdate = function (filter, option) {
    //打开数据库
    return adminEnrollTrainModel.update(filter, option, {
        multi: true
    }).exec();
};
// return qry.out("temps").exec().then(function() {
//         return mongoose.model('temp', new mongoose.Schema({
//             studentId: String,
//             studentName: String
//         }, {
//             collection: 'temps'
//         })).find();
//     });