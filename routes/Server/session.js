var Session = require('../../models/sessions.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.post('/admin/session/removeAll', checkLogin);
    app.post('/admin/session/removeAll', function(req, res) {
        Session.removeAll().then(function() {
            res.jsonp({ sucess: true });
        });
    });
}