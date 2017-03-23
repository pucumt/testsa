var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

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
    totalStudentCount: Number, //招生人数
    enrollCount: Number, //报名人数
    totalClassCount: Number, //共多少课时
    trainPrice: Number,
    materialPrice: Number,
    teacherId: String,
    teacherName: String,
    courseStartDate: Date,
    courseEndDate: Date,
    courseTime: String,
    courseContent: String,
    classRoomId: String,
    classRoomName: String,
    schoolId: String,
    schoolArea: String,
    isWeixin: Number, //0 new 1 publish 0 stop
    isStop: Boolean,
    isDeleted: Boolean
}, {
    collection: 'trainClasss'
});

var trainClassModel = mongoose.model('trainClass', trainClassSchema);

function TrainClass(option) {
    this.option = option;
};

module.exports = TrainClass;

//存储学区信息
TrainClass.prototype.save = function(callback) {
    var newtrainClass = new trainClassModel(this.option);

    newtrainClass.save(function(err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);

        //db.close();
    });
};

TrainClass.prototype.update = function(id, callback) {
    trainClassModel.update({
        _id: id
    }, this.option).exec(function(err, trainClass) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
TrainClass.get = function(id, callback) {
    //打开数据库
    trainClassModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);

        //db.close();
    });
};

//一次获取20个学区信息
TrainClass.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = trainClassModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, trainClasss) {
                callback(null, trainClasss, count);
            });
    });
};

//删除一个学区
TrainClass.delete = function(id, callback) {
    trainClassModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

//发布
TrainClass.publish = function(id, callback) {
    trainClassModel.update({
        _id: id
    }, {
        isWeixin: 1
    }).exec(function(err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

//停用
TrainClass.unPublish = function(id, callback) {
    trainClassModel.update({
        _id: id
    }, {
        isWeixin: 9
    }).exec(function(err, trainClass) {
        if (err) {
            return callback(err);
        }
        callback(null, trainClass);
    });
};

TrainClass.enroll = function(id) {
    return trainClassModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            return trainClassModel.update({
                _id: id,
                enrollCount: { $lt: exam.totalStudentCount }
            }, { $inc: { enrollCount: 1 } }).exec();
        });
};

TrainClass.cancel = function(id) {
    return trainClassModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            return trainClassModel.update({
                _id: id
            }, { $inc: { enrollCount: -1 } }).exec();
        });
};