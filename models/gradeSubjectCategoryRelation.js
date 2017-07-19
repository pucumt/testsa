var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var gradeSubjectCategoryRelationSchema = new mongoose.Schema({
    gradeSubjectId: ObjectId,
    gradeId: ObjectId,
    gradeName: String,
    subjectId: ObjectId,
    subjectName: String,
    categoryId: ObjectId,
    categoryName: String,
    isDeleted: { type: Boolean, default: false }
}, {
    collection: 'gradeSubjectCategoryRelations'
});

var gradeSubjectCategoryRelationModel = mongoose.model('gradeSubjectCategoryRelation', gradeSubjectCategoryRelationSchema);

function GradeSubjectCategoryRelation(option) {
    this.option = option;
};

module.exports = GradeSubjectCategoryRelation;

//存储学区信息
GradeSubjectCategoryRelation.prototype.save = function() {
    var newgradeSubjectCategoryRelation = new gradeSubjectCategoryRelationModel(this.option);

    return newgradeSubjectCategoryRelation.save();
};

GradeSubjectCategoryRelation.prototype.update = function(id, callback) {
    gradeSubjectCategoryRelationModel.update({
        _id: id
    }, this.option).exec(function(err, gradeSubjectCategoryRelation) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
GradeSubjectCategoryRelation.get = function(id, callback) {
    //打开数据库
    gradeSubjectCategoryRelationModel.findOne({ _id: id, isDeleted: { $ne: true } }, function(err, gradeSubjectCategoryRelation) {
        if (err) {
            return callback(err);
        }
        callback(null, gradeSubjectCategoryRelation);

        //db.close();
    });
};

//一次获取20个学区信息
GradeSubjectCategoryRelation.getAll = function(id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    var query = gradeSubjectCategoryRelationModel.count(filter);
    query.exec(function(err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function(err, gradeSubjectCategoryRelations) {
                callback(null, gradeSubjectCategoryRelations, count);
            });
    });
};

//删除一个学区
GradeSubjectCategoryRelation.delete = function(id, callback) {
    gradeSubjectCategoryRelationModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec(function(err, gradeSubjectCategoryRelation) {
        if (err) {
            return callback(err);
        }
        callback(null, gradeSubjectCategoryRelation);
    });
};

GradeSubjectCategoryRelation.getFilters = function(filter) {
    //打开数据库
    filter.isDeleted = { $ne: true };
    return gradeSubjectCategoryRelationModel.find(filter);
};