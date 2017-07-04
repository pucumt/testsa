var TrainClass = require('../../models/trainClass.js'),
    AdminEnrollTrain = require('../../models/adminEnrollTrain.js'),
    StudentInfo = require('../../models/studentInfo.js'),
    AbsentStudents = require('../../models/absentStudents.js'),
    auth = require("./auth"),
    moment = require("moment"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function(app) {
    app.get('/Teacher/rollCallClasses', checkLogin);
    app.get('/Teacher/rollCallClasses', function(req, res) {
        res.render('Teacher/rollCall_classes.html', {
            title: '选课点名',
            user: req.session.teacher
        });
    });

    app.get('/Teacher/rollCallClasses/extra', checkLogin);
    app.get('/Teacher/rollCallClasses/extra', function(req, res) {
        res.render('Teacher/rollCall_classes_extra.html', {
            title: '补课情况',
            user: req.session.teacher
        });
    });

    app.post('/Teacher/rollCall/classes', function(req, res) {
        //debugger;
        TrainClass.getFilters({
            teacherId: req.session.teacher._id
        }).then(function(classs) {
            res.jsonp({
                classs: classs
            });
        });
    });

    app.get('/Teacher/rollCall/students/:id', checkLogin);
    app.get('/Teacher/rollCall/students/:id', function(req, res) {
        res.render('Teacher/rollCall_class_students.html', {
            title: '点名',
            user: req.session.teacher,
            id: req.params.id
        });
    });

    app.post('/Teacher/rollCall/students', function(req, res) {
        AdminEnrollTrain.getFilters({
                trainId: req.body.id,
                isSucceed: 1
            })
            .then(function(orders) {
                var students = [],
                    pArray = [];
                orders.forEach(function(order) {
                    var p = StudentInfo.get(order.studentId).then(function(student) {
                        students.push(student);
                    });
                    pArray.push(p);
                });

                Promise.all(pArray).then(function() {
                    var filter = {
                        classId: req.body.id,
                        absentDate: moment().format("YYYY-MM-DD")
                    };
                    if (req.body.absentDate) {
                        filter.absentDate = moment(req.body.absentDate).format("YYYY-MM-DD");
                    }

                    AbsentStudents.getFilters(filter).then(function(abStudents) {
                        res.jsonp({
                            students: students,
                            abStudents: abStudents
                        });
                    });
                });
            });
    });

    function absentStudent(classId, studentIds, absentDate) {
        //new not existing students
        return TrainClass.get(classId)
            .then(function(trainClass) {
                if (trainClass) {
                    var pArray = [];
                    studentIds.forEach(function(id) {
                        var p = StudentInfo.get(id).then(function(student) {
                            var abStudent = new AbsentStudents({
                                studentId: student._id,
                                studentName: student.name,
                                mobile: student.mobile,
                                absentDate: absentDate, //缺勤日期
                                classId: trainClass._id,
                                className: trainClass.name, //缺勤课程
                                teacherId: trainClass.teacherId,
                                teacherName: trainClass.teacherName, //缺勤老师
                                schoolId: trainClass.schoolId,
                                schoolName: trainClass.schoolName, //校区
                            });
                            return abStudent.save();
                        });
                        pArray.push(p);
                    });
                    return Promise.all(pArray);
                }
            });
    };

    app.post('/Teacher/absent/students', checkJSONLogin);
    app.post('/Teacher/absent/students', function(req, res) {
        // AbsentStudents
        var filter = {
            classId: req.body.classId,
        };
        if (req.body.absentDate) {
            filter.absentDate = moment(req.body.absentDate).format("YYYY-MM-DD");
        } else {
            filter.absentDate = moment().format("YYYY-MM-DD");
        }
        var studentIds = JSON.parse(req.body.studentIds);
        AbsentStudents.getFilters(filter).then(function(orgAbStudents) {
            if (orgAbStudents.length > 0) {
                //已经有缺席学生
                //去除不在缺席的学生
                var needRemoveStudentIds = [];
                orgAbStudents.filter(function(orgAbStudent) {
                    if (!studentIds.some(function(id) {
                            id == orgAbStudent.studentId;
                        })) {
                        needRemoveStudentIds.push(orgAbStudent.studentId);
                    }
                });
                filter.studentId = { $id: needRemoveStudentIds };
                var p0 = AbsentStudents.delete(filter);
                //添加新缺席的学生
                var newAbStudents = studentIds.filter(function(id) {
                    return !orgAbStudents.some(function(orgAbStudent) {
                        id == orgAbStudent.studentId;
                    });
                });
                var p1 = absentStudent(req.body.classId, newAbStudents, filter.absentDate);

                Promise.all([p0, p1]).then(function() {
                    res.jsonp({ sucess: true });
                });
            } else {
                //之前无缺席学生
                if (studentIds.length > 0) {
                    //缺席处理
                    absentStudent(req.body.classId, studentIds, filter.absentDate)
                        .then(function() {
                            res.jsonp({ sucess: true });
                        });
                } else {
                    res.jsonp({ sucess: true });
                }
            }
        });
    });

    app.post('/Teacher/absent/students/makeUp', checkJSONLogin);
    app.post('/Teacher/absent/students/makeUp', function(req, res) {
        var studentIds = JSON.parse(req.body.studentIds); //current absentStudents
        var newAbsentStudents = []; //新缺课学生
        var newExtraStudents = []; //补课学生
        if (studentIds.length > 0) {
            //补课学生
            AbsentStudents.makeUp({
                studentId: { $in: studentIds },
                classId: req.body.classId,
                absentDate: moment(req.body.absentDate).format("YYYY-MM-DD")
            }).then(function() {
                res.jsonp({ sucess: true });
            });
        } else {
            //无补课学生
            res.jsonp({ sucess: true });
        }
    });

    app.get('/Teacher/rollCallextra/students/:id', checkLogin);
    app.get('/Teacher/rollCallextra/students/:id', function(req, res) {
        res.render('Teacher/rollCall_class_students_extra.html', {
            title: '点名',
            user: req.session.teacher,
            id: req.params.id
        });
    });
}