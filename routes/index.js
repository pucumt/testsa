var client = require('./Client/index.js'),
    exec = require('child_process').exec, //,
    server = require('./Server/index.js'),
    // test = require('./Test/index.js'),
    generator = require('./Test/generator.js');
// dbPressure = require('./Test/dbPressure.js'),
// openIdGeter = require('./Test/openIdGeter');

module.exports = function(app) {
    client(app);
    server(app);
    //test(app);
    generator(app);
    // dbPressure(app);
    // openIdGeter(app);

    app.use(function(req, res) {
        res.render("404");
    });
};