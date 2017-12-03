var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    GradeSubjectCategoryRelation = model.gradeSubjectCategoryRelation,
    SubjectCategoryPLevelRelation = model.subjectCategoryPLevelRelation,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/ProcessLevelList', checkLogin);
    app.get('/admin/ProcessLevelList', function (req, res) {
        res.render('Server/subjectCategoryPLevelRelationList.html', {
            title: '>科目难度平行班列表',
            user: req.session.admin
        });
    });

    app.post('/admin/subjectCategoryPLevelRelationList/search', checkLogin);
    app.post('/admin/subjectCategoryPLevelRelationList/search', function (req, res) {
        var result = {};
        model.db.sequelize.query("select distinct R.subjectId,R.categoryId, S.name as subjectName, C.name as categoryName from gradeSubjectCategoryRelations R join subjects S on R.subjectId=S._id \
            join categorys C on R.categoryId=C._id \
            where R.isDeleted=false order by R.subjectId, R.categoryId", {
                replacements: {},
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(relations => {
                res.jsonp(relations);
            });
    });


}