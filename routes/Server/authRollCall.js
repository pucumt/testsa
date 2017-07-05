module.exports = {
    checkLogin: function(req, res, next) {
        //if (!req.session.admin || req.session.admin.name != "11") {
        if (!req.session.adminRollCall) {
            res.redirect('/admin/login');
            return;
        }
        next();
    },
    checkNotLogin: function(req, res, next) {
        //if (req.session.admin && req.session.admin.name == "11") {
        if (req.session.adminRollCall) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
};