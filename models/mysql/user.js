const db = require('../../db');

const User = db.defineModel('users', {
    name: {
        type: db.STRING(20),
        unique: true
    },
    password: db.STRING(50),
    email: {
        type: db.STRING(50),
        allowNull: true
    },
    mobile: {
        type: db.STRING(20),
        allowNull: true
    },
    role: db.INTEGER, //0 superAdmin, 3 schoolAdmin, 10 rollCallUser, 7 team leader
    isDeleted: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    schoolId: {
        type: db.STRING(32),
        defaultValue: ''
    },
    schoolArea: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = User;

//读取用户信息
User.get = function (name) {
    return User.findOne({
        'where': {
            'name': name
        }
    });
};

// this is a test function
User.testSync = function () {
    db.sync();
};