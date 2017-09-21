var RollCallConfigure = require('../../models/rollCallConfigure.js'),
    Year = require('../../models/year.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    // function checkIsConfigureExist() {
    //     //just used for the first run, and then be comments
    //     RollCallConfigure.get().then(function(configure) {
    //         if (!configure) {
    //             configure = new RollCallConfigure({
    //                 yearId: global.currentYear._id,
    //                 yearName: global.currentYear.name,
    //                 sequence: global.currentYear.sequence
    //             });
    //             configure.save();
    //         }
    //     });
    // };

    // checkIsConfigureExist();

    app.get('/admin/rollCallConfigureList', checkLogin);
    app.get('/admin/rollCallConfigureList', function (req, res) {
        res.render('Server/rollCallConfigureList.html', {
            title: '>设置点名课程的年度',
            user: req.session.admin
        });
    });

    app.post('/admin/rollCallConfigure/edit', checkLogin);
    app.post('/admin/rollCallConfigure/edit', function (req, res) {
        //req.body.status,
        RollCallConfigure.get().then(function (configure) {
            var option = {
                yearId: req.body.yearId,
                yearName: req.body.yearName,
                sequence: req.body.sequence
            }
            RollCallConfigure.batchUpdate({}, option).then(function () {
                res.jsonp(option);
            });
        });
    });

    app.post('/admin/rollCallConfigureList/search', checkLogin);
    app.post('/admin/rollCallConfigureList/search', function (req, res) {
        Year.getFilters({})
            .then(function (years) {
                RollCallConfigure.get().then(function (configure) {
                    res.jsonp({
                        configure: configure,
                        years: years
                    });
                });
            });
    });
}