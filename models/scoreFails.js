var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var scoreFailSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    score: String,
    examId: String,
    subject: String
}, {
    collection: 'scoreFails'
});

var scoreFailModel = mongoose.model('scoreFail', scoreFailSchema);

function ScoreFail(option) {
    this.option = option;
};

module.exports = ScoreFail;

//存储学区信息
ScoreFail.prototype.save = function() {
    var newScoreFail = new scoreFailModel(this.option);
    return newScoreFail.save();
};

//一次获取20个学区信息
ScoreFail.getAllWithoutPaging = function(filter) {
    if (filter) {
        filter.isDeleted = { $ne: true };
    } else {
        filter = { isDeleted: { $ne: true } };
    }
    return scoreFailModel.find(filter);
};