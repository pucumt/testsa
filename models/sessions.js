var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var sessionSchema = new mongoose.Schema({
    session: String
}, {
    collection: 'sessions'
});

var sessionModel = mongoose.model('session', sessionSchema);

function Session(option) {
    this.option = option;
};

module.exports = Session;

//存储学区信息
Session.removeAll = function() {
    return sessionModel.remove().exec();
};