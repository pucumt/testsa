module.exports = {
    checkLogin: function(req, res, next) {
        //if (!req.session.admin || req.session.admin.name != "11") {
        if (!req.session.admin) {
            res.redirect('/admin/login');
            return;
        }
        next();
    },
    checkNotLogin: function(req, res, next) {
        //if (req.session.admin && req.session.admin.name == "11") {
        if (req.session.admin) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
};