var home = require('./home.js'),
    enroll = require('./enroll.js'),
    login = require('./login.js'),
    user = require('./user.js'),
    order = require('./order.js'),
    person = require('./person.js'),
    coupon = require('./coupon.js'),
    book = require('./book.js'),
    signature = require('./signature.js'),
    reg = require('./reg.js');

module.exports = function (app) {
    // home(app);
    enroll(app);
    login(app);
    reg(app);
    user(app);
    person(app);
    order(app);
    coupon(app);
    signature(app);
    book(app);
};