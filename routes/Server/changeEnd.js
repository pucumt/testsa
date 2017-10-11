var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ChangeEnd = model.changeEnd,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/changeEnd', checkLogin);
    app.get('/admin/changeEnd', function (req, res) {
        res.render('Server/changeEndList.html', {
            title: '>调课截至日期',
            user: req.session.admin
        });
    });

    app.post('/admin/changeEnd/save', checkLogin);
    app.post('/admin/changeEnd/save', function (req, res) {
        ChangeEnd.getFilter({})
            .then(function (changeEnd) {
                if (changeEnd) {
                    // update
                    changeEnd.endDate = req.body.name;
                    changeEnd.save().then(function () {
                        res.jsonp({
                            sucess: true
                        });
                    });
                } else {
                    // new
                    ChangeEnd.create({
                        endDate: req.body.name
                    }).then(function () {
                        res.jsonp({
                            sucess: true
                        });
                    });
                }
            });
    });

    app.post('/admin/changeEndList/get', checkLogin);
    app.post('/admin/changeEndList/get', function (req, res) {
        ChangeEnd.getFilter({})
            .then(function (changeEnd) {
                res.jsonp(changeEnd);
            });
    });
}