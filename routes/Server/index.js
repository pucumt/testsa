var login = require('./login.js'),
    logout = require('./logout.js'),

    user = require('./user.js'),
    schoolArea = require('./schoolArea.js'),
    grade = require('./grade.js'),
    classRoom = require('./classRoom.js'),
    //examRoom = require('./examRoom.js'),
    examArea = require('./examArea.js'),
    teacher = require('./teacher.js'),
    year = require('./year.js'),
    weekType = require('./weekType.js'),
    timeType = require('./timeType.js'),
    changeEnd = require('./changeEnd.js'),

    trainClass = require('./trainClass.js'),
    category = require('./category.js'),
    subject = require('./subject.js'),
    classAttribute = require('./classAttribute.js'),
    examClass = require('./examClass.js'),
    examCategory = require('./examCategory.js'),
    examClassExamArea = require('./examClassExamArea.js'),

    adminEnrollExam = require('./adminEnrollExam.js'),
    adminEnrollTrain = require('./adminEnrollTrain.js'),

    studentAccount = require('./studentAccount.js'),
    studentInfo = require('./studentInfo.js'),
    coupon = require('./coupon.js'),
    couponAssign = require('./couponAssign.js'),
    uploadFile = require('./uploadFile.js'),

    schoolReport = require('./schoolReport.js'),
    session = require('./session.js'),

    absentStudents = require('./absentStudents.js'),

    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin', checkLogin)
    app.get('/admin', function(req, res) {
        res.render('Server/adminEnrollTrainList.html', {
            title: '主页',
            user: req.session.admin
        });
    });

    login(app);
    logout(app);

    //basic
    user(app);
    schoolArea(app);
    grade(app);
    classRoom(app);
    //examRoom(app);
    examArea(app);
    teacher(app);
    year(app);
    weekType(app);
    timeType(app);
    changeEnd(app);

    category(app);
    subject(app);
    classAttribute(app);

    //class
    trainClass(app);
    examClass(app);
    examCategory(app);
    examClassExamArea(app);

    //enroll
    adminEnrollExam(app);
    adminEnrollTrain(app);

    //student
    studentAccount(app);
    studentInfo(app);
    coupon(app);
    couponAssign(app);

    uploadFile(app);

    //finatial
    schoolReport(app);
    session(app);

    absentStudents(app);
};