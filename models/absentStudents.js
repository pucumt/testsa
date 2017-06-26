var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var absentStudentsSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    absentDate: { type: Date, default: Date.now }, //缺勤日期
    classId: String,
    className: String, //缺勤课程
    teacherId: String,
    teacherName: String, //缺勤老师
    schoolId: String,
    schoolName: String, //校区
    comment: String, //缺勤原因
    isCheck: Number, //是否处理过
    isDeleted: { type: Boolean, default: false }, //缺勤或者点错
    createdDate: { type: Date, default: Date.now } //创建日期
}, {
    collection: 'absentStudentss'
});

var absentStudentsModel = mongoose.model('absentStudents', absentStudentsSchema);

function AbsentStudents(option) {
    this.option = option;
};

module.exports = AbsentStudents;

//存储学区信息
AbsentStudents.prototype.save = function() {
    var newabsentStudents = new absentStudentsModel(this.option);

    return newabsentStudents.save();
};

AbsentStudents.prototype.update = function(id) {
    return absentStudentsModel.update({
        _id: id
    }, this.option).exec();
};

//读取学区信息
AbsentStudents.get = function(id) {
    //打开数据库
    return absentStudentsModel.findOne({ _id: id, isDeleted: { $ne: true } });
};

//一次获取20个学区信息
AbsentStudents.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = absentStudentsModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, absentStudentss) {
                callback(null, absentStudentss, count);
            });
    });
};

//删除一个学区
AbsentStudents.delete = function(id) {
    return absentStudentsModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};