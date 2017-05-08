var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var addStudentToClassFailSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    className: String,
    reason: String
}, {
    collection: 'addStudentToClassFails'
});

var addStudentToClassFailModel = mongoose.model('addStudentToClassFail', addStudentToClassFailSchema);

function addStudentToClassFail(option) {
    this.option = option;
};

module.exports = addStudentToClassFail;

//存储学区信息
addStudentToClassFail.prototype.save = function() {
    var newaddStudentToClassFail = new addStudentToClassFailModel(this.option);
    return newaddStudentToClassFail.save();
};

//一次获取20个学区信息
addStudentToClassFail.getFilters = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return addStudentToClassFailModel.find(filter);
};

addStudentToClassFail.clearAll = function() {
    return addStudentToClassFailModel.remove();
};