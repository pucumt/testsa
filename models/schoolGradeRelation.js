var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var schoolGradeRelationSchema = new mongoose.Schema({
    schoolId: ObjectId,
    schoolArea: String,
    gradeId: ObjectId,
    gradeName: String,
    isDeleted: { type: Boolean, default: false }
}, {
    collection: 'schoolGradeRelations'
});

var schoolGradeRelationModel = mongoose.model('schoolGradeRelation', schoolGradeRelationSchema);

function SchoolGradeRelation(option) {
    this.option = option;
};

module.exports = SchoolGradeRelation;

//存储学区信息
SchoolGradeRelation.prototype.save = function(callback) {
    var newschoolGradeRelation = new schoolGradeRelationModel(this.option);

    return newschoolGradeRelation.save();
};

SchoolGradeRelation.prototype.update = function(id, callback) {
    schoolGradeRelationModel.update({
        _id: id
    }, this.option).exec(function(err, schoolGradeRelation) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
SchoolGradeRelation.get = function(id, callback) {
    //打开数据库
    schoolGradeRelationModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, schoolGradeRelation) {
        if (err) {
            return callback(err);
        }
        callback(null, schoolGradeRelation);

        //db.close();
    });
};

//一次获取20个学区信息
SchoolGradeRelation.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = schoolGradeRelationModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, schoolGradeRelations) {
                callback(null, schoolGradeRelations, count);
            });
    });
};

//删除一个学区
SchoolGradeRelation.delete = function(filter) {
    return schoolGradeRelationModel.update(filter, {
        isDeleted: true
    }, { multi: true }).exec();
};

SchoolGradeRelation.deleteAll = function(filter) {
    return schoolGradeRelationModel.update(filter, {
        isDeleted: true
    }, { multi: true }).exec();
};

SchoolGradeRelation.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return schoolGradeRelationModel.find(filter);
};