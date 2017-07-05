var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var absentClassSchema = new mongoose.Schema({
    absentDate: { type: Date, default: Date.now }, //缺勤日期
    classId: String,
    className: String, //缺勤课程
    teacherId: String,
    teacherName: String, //缺勤老师
    schoolId: String,
    schoolName: String, //校区
    courseTime: String, //上课时间
    isDeleted: { type: Boolean, default: false }, //缺勤或者点错
    createdDate: { type: Date, default: Date.now }, //创建日期
    deletedDate: Date //删除日期
}, {
    collection: 'absentClasss'
});

var absentClassModel = mongoose.model('absentClass', absentClassSchema);

function AbsentClass(option) {
    this.option = option;
};

module.exports = AbsentClass;

//存储学区信息
AbsentClass.prototype.save = function() {
    var newabsentClass = new absentClassModel(this.option);

    return newabsentClass.save();
};

AbsentClass.prototype.update = function(id) {
    return absentClassModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
AbsentClass.get = function(id) {
    //打开数据库
    return absentClassModel.findOne({ _id: id, isDeleted: { $ne: true } });
};

//一次获取20个学区信息
AbsentClass.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = absentClassModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .sort({ _id: 1 })
            .skip((page - 1) * 50)
            .limit(50)
            .exec(function(err, absentClasss) {
                callback(null, absentClasss, count);
            });
    });
};

//删除一个学区
AbsentClass.delete = function(filter) {
    return absentClassModel.update(filter, {
        isDeleted: true,
        deletedDate: new Date()
    }, { multi: true }).exec();
};

AbsentClass.getFilters = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return absentClassModel.find(filter);
};