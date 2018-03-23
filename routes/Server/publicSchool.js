var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SchoolArea = model.schoolArea,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/publicSchool', checkLogin);
    app.get('/admin/publicSchool', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        SchoolArea.getFiltersWithPage(page, {}).then(function (result) {
            res.render('Server/publicSchoolList.html', {
                title: '>校区设置',
                user: req.session.admin,
                schoolAreas: result.rows,
                total: result.count
            });
        });
    });
}