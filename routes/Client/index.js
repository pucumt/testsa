var enroll = require('./enroll.js'),
    home = require('./home.js'),
    login = require('./login.js'),
    user = require('./user.js'),
    person = require('./person.js');
// reg = require('./reg.js'),

module.exports = function(app) {
    home(app);
    enroll(app);
    login(app);
    user(app);
    person(app);

    // logout(app);

    // post(app);

    // reg(app);

    // eng100(app);
};