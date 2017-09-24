var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection,
    ObjectId = mongoose.Schema.Types.ObjectId;

var gradeSubjectRelationSchema = new mongoose.Schema({
    gradeId: ObjectId,
    gradeName: String,
    subjectId: ObjectId,
    subjectName: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'gradeSubjectRelations'
});

var gradeSubjectRelationModel = mongoose.model('gradeSubjectRelation', gradeSubjectRelationSchema);

function GradeSubjectRelation(option) {
    this.option = option;
};

module.exports = GradeSubjectRelation;

//存储学区信息
GradeSubjectRelation.prototype.save = function () {
    var newgradeSubjectRelation = new gradeSubjectRelationModel(this.option);

    return newgradeSubjectRelation.save();
};

GradeSubjectRelation.prototype.update = function (id, callback) {
    gradeSubjectRelationModel.update({
        _id: id
    }, this.option).exec(function (err, gradeSubjectRelation) {
        if (err) {
            return callback(err);
        }
        this.option._id = id;
        callback(null, this.option);
    }.bind(this));
};

//读取学区信息
GradeSubjectRelation.get = function (id) {
    //打开数据库
    return gradeSubjectRelationModel.findOne({
        _id: id,
        isDeleted: {
            $ne: true
        }
    });
};

//一次获取20个学区信息
GradeSubjectRelation.getAll = function (id, page, filter, callback) {
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
    var query = gradeSubjectRelationModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, gradeSubjectRelations) {
                callback(null, gradeSubjectRelations, count);
            });
    });
};

//删除一个学区
GradeSubjectRelation.delete = function (id) {
    return gradeSubjectRelationModel.update({
        _id: id
    }, {
        isDeleted: true
    }).exec();
};

GradeSubjectRelation.deleteAll = function (filter) {
    return gradeSubjectRelationModel.update(filter, {
        isDeleted: true
    }, {
        multi: true
    }).exec();
};

GradeSubjectRelation.getFilters = function (filter) {
    //打开数据库
    filter.isDeleted = {
        $ne: true
    };
    return gradeSubjectRelationModel.find(filter);
};

GradeSubjectRelation.rawAll = function () {
    return gradeSubjectRelationModel.find();
};