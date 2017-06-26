var login = require('./login.js'),
    user = require('./user.js');

module.exports = function(app) {
    login(app);
    user(app);
};