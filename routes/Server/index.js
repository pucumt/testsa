var login = require('./login.js'),
    logout = require('./logout.js'),

    user = require('./user.js'),
    schoolArea = require('./schoolArea.js'),
    grade = require('./grade.js'),
    classRoom = require('./classRoom.js'),
    teacher = require('./teacher.js'),
    year = require('./year.js'),

    trainClass = require('./trainClass.js'),
    category = require('./category.js'),
    subject = require('./subject.js'),
    examClass = require('./examClass.js'),
    examCategory = require('./examCategory.js'),

    adminEnrollExam = require('./adminEnrollExam.js'),
    adminEnrollTrain = require('./adminEnrollTrain.js'),

    studentAccount = require('./studentAccount.js'),
    studentInfo = require('./studentInfo.js'),

    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin', checkLogin)
    app.get('/admin', function(req, res) {
        res.render('Server/index.html', {
            title: '主页',
            user: req.session.user
        });
    });

    login(app);
    logout(app);

    //basic
    user(app);
    schoolArea(app);
    grade(app);
    classRoom(app);
    teacher(app);
    year(app);
    category(app);
    subject(app);

    //class
    trainClass(app);
    examClass(app);
    examCategory(app);

    //enroll
    adminEnrollExam(app);
    adminEnrollTrain(app);

    //student
    studentAccount(app);
    studentInfo(app);
};