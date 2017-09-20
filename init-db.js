const model = require('./model.js'),
    mongoUser = require('./models/user.js'),
    mongoGrade = require('./models/grade.js');

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});

model.sync().then(function () {
    var pArray = [];
    // import user
    var pUser = mongoUser.rawAll().then(function (users) {
        var tmpArray = [];
        users.forEach(function (obj) {
            var newObj = obj.toJSON();
            newObj._id = newObj._id.toJSON();
            tmpArray.push(model.user.create(newObj));
        });
        return Promise.all(tmpArray);
    });
    pArray.push(pUser);

    // import grade
    var pGrade = mongoGrade.rawAll().then(function (grades) {
        var tmpArray = [];
        grades.forEach(function (obj) {
            var newObj = obj.toJSON();
            newObj._id = newObj._id.toJSON();
            tmpArray.push(model.grade.create(newObj));
        });
        return Promise.all(tmpArray);
    });
    pArray.push(pGrade);

    Promise.all(pArray).then(function () {
        console.log('init db ok.');
        process.exit(0);
    });
});