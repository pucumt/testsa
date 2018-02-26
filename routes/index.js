var client = require('./Client/index.js'),
    exec = require('child_process').exec, //,
    updateStudentAccount = require('./Test/updateStudentAccount.js'),
    server = require('./Server/index.js'),
    teacher = require('./Teacher/index.js'),
    test = require('./Test/index.js'),
    generator = require('./Test/generator.js'),
    fileGenerator = require('./Test/fileGenerator.js');
// dbPressure = require('./Test/dbPressure.js'),
// openIdGeter = require('./Test/openIdGeter');

module.exports = function (app) {
    client(app);
    server(app);
    teacher(app);
    test(app);
    generator(app);
    fileGenerator(app);
    // dbPressure(app);
    // openIdGeter(app);
    updateStudentAccount(app);

    app.use(function (req, res) {
        res.render("404.html");
    });
};