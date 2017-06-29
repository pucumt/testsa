var login = require('./login.js'),
    rollCall = require('./rollCall.js'),
    user = require('./user.js');

module.exports = function(app) {
    login(app);
    rollCall(app);
    //user(app);
};