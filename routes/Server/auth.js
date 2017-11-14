module.exports = {
    checkLogin: function (req, res, next) {
        //if (!req.session.admin || req.session.admin.name != "11") {
        if (!req.session.admin) {
            res.redirect('/admin/login');
            return;
        }
        next();
    },
    checkNotLogin: function (req, res, next) {
        //if (req.session.admin && req.session.admin.name == "11") {
        if (req.session.admin) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
    checkSecure: function (passRoles) {
        return function (req, res, next) {
            if (passRoles.some(function (role) {
                    return role == req.session.admin.role;
                })) {
                next();
                return;
            } else {
                if (req.method == "GET") {
                    res.render("404.html");
                    return;
                } else {
                    res.status(404).send("NOT FOUND");
                    return;
                }
            }
        };
    }
};