var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    EnrollProcessConfigure = model.enrollProcessConfigure,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    // function checkIsConfigureExist() {
    //     //just used for the first run, and then be comments
    //     EnrollProcessConfigure.getFilter({}).then(function (configure) {
    //         if (!configure) {
    //             configure = new EnrollProcessConfigure({
    //                 newStudentStatus: false,
    //                 oldStudentStatus: false,
    //                 oldStudentSwitch: false,
    //                 isGradeUpgrade: false
    //             });
    //             configure.save();
    //         }
    //     });

    // };

    // checkIsConfigureExist();

    app.get('/admin/enrollProcess', checkLogin);
    app.get('/admin/enrollProcess', function (req, res) {
        res.render('Server/enrollProcessConfigureList.html', {
            title: '>报名过程控制',
            user: req.session.admin
        });
    });

    app.post('/admin/enrollProcessConfigure/edit', checkLogin);
    app.post('/admin/enrollProcessConfigure/edit', function (req, res) {
        //req.body.status,
        EnrollProcessConfigure.getFilter({})
            .then(function (configure) {
                var option = {}
                switch (req.body.status) {
                    case "new":
                        option.newStudentStatus = !configure.newStudentStatus;
                        break;
                    case "old":
                        option.oldStudentStatus = !configure.oldStudentStatus;
                        break;
                    case "switch":
                        option.oldStudentSwitch = !configure.oldStudentSwitch;
                        break;
                    case "grade":
                        option.isGradeUpgrade = !configure.isGradeUpgrade;
                        break;

                }
                EnrollProcessConfigure.update(option, {
                        where: {}
                    })
                    .then(function () {
                        res.jsonp(option);
                    });
            });
    });

    app.post('/admin/enrollProcessConfigureList/search', checkLogin);
    app.post('/admin/enrollProcessConfigureList/search', function (req, res) {
        EnrollProcessConfigure.getFilter({})
            .then(function (configure) {
                res.jsonp(configure);
            });
    });
}