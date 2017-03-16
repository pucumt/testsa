module.exports = {
    checkLogin: function(req, res, next) {
        //if (!req.session.user || req.session.user.name != "11") {
        if (!req.session.user) {
            res.redirect('/admin/login');
            return;
        }
        next();
    },
    checkNotLogin: function(req, res, next) {
        //if (req.session.user && req.session.user.name == "11") {
        if (req.session.user) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
};