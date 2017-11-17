var login = require('./login.js'),
    rollCall = require('./rollCall.js'),
    user = require('./user.js'),
    book = require('./book.js'),
    report = require('./report.js');

module.exports = function (app) {
    login(app);
    rollCall(app);
    user(app);
    book(app);
    report(app);
};