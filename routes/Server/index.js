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
    schoolGradeRelation = require('./schoolGradeRelation.js'),
    gradeSubjectRelation = require('./gradeSubjectRelation.js'),
    gradeSubjectCategoryRelation = require('./gradeSubjectCategoryRelation.js'),
    yearAttributeRelation = require('./yearAttributeRelation.js'),

    quiz = require('./quiz.js'),
    quizStudentScore = require('./quizStudentScore.js'),

    trainClass = require('./trainClass.js'),
    category = require('./category.js'),
    subject = require('./subject.js'),
    classAttribute = require('./classAttribute.js'),
    examClass = require('./examClass.js'),
    examCategory = require('./examCategory.js'),
    examClassExamArea = require('./examClassExamArea.js'),
    enrollProcessConfigure = require('./enrollProcessConfigure.js'),
    rollCallConfigure = require('./rollCallConfigure.js'),
    subjectCategoryPLevelRelation = require('./subjectCategoryPLevelRelation.js'),

    adminEnrollExam = require('./adminEnrollExam.js'),
    adminEnrollTrain = require('./adminEnrollTrain.js'),
    rebateEnrollTrain = require('./rebateEnrollTrain.js'),
    rebateEnrollExam = require('./rebateEnrollExam.js'),

    studentAccount = require('./studentAccount.js'),
    studentInfo = require('./studentInfo.js'),
    coupon = require('./coupon.js'),
    couponAssign = require('./couponAssign.js'),
    uploadFile = require('./uploadFile.js'),

    schoolReport = require('./schoolReport.js'),
    session = require('./session.js'),

    absentStudents = require('./absentStudents.js'),

    book = require('./book.js'),
    lesson = require('./lesson.js'),
    lessonContent = require('./lessonContent.js'),

    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin', checkLogin)
    app.get('/admin', auth.checkSecure([0, 3, 7, 8]));
    app.get('/admin', function (req, res) {
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
    schoolGradeRelation(app);
    gradeSubjectRelation(app);
    gradeSubjectCategoryRelation(app);
    yearAttributeRelation(app);

    category(app);
    subject(app);
    classAttribute(app);

    //class
    trainClass(app);
    examClass(app);
    examCategory(app);
    examClassExamArea(app);
    enrollProcessConfigure(app);
    rollCallConfigure(app);
    subjectCategoryPLevelRelation(app);

    //enroll
    adminEnrollExam(app);
    adminEnrollTrain(app);
    rebateEnrollTrain(app);
    rebateEnrollExam(app);

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

    // book
    book(app);
    lesson(app);
    // lessonWord(app);
    lessonContent(app);
    // lessonSentence(app);

    quiz(app);
    quizStudentScore(app);
};