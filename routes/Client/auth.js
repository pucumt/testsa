module.exports = {
    checkLogin: function(req, res, next) {
        if (!req.session.user) {
            req.session.originalUrl = req.originalUrl;
            res.redirect('/login');
            return;
        }
        next();
    },
    checkJSONLogin: function(req, res, next) {
        if (!req.session.user) {
            req.session.originalUrl = req.body.originalUrl;
            res.jsonp({ notLogin: true });
            return;
        }
        next();
    },
    checkNotLogin: function(req, res, next) {
        if (req.session.user) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
};