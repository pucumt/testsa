module.exports = {
checkLogin: function(req, res, next) {
    if (!req.session.user || req.session.user.name != "11") {
      res.redirect('/admin/login');
    }
    next();
  },
  checkNotLogin: function(req, res, next) {
    if (req.session.user && req.session.user.name == "11") {
      res.redirect('back');//返回之前的页面
    }
    next();
  },
};