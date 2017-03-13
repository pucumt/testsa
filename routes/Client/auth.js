module.exports = {
  checkLogin: function (req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }
    next();
  },
  checkNotLogin: function (req, res, next) {
    if (req.session.user) {
      res.redirect('back'); //返回之前的页面
      return;
    }
    next();
  },
};