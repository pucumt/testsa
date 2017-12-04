var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    GradeSubjectCategoryRelation = model.gradeSubjectCategoryRelation,
    SubjectCategoryPLevelRelation = model.subjectCategoryPLevelRelation,
    Subject = model.subject,
    Category = model.category,
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
            where R.isDeleted=false and R.subjectId=:subjectId order by R.subjectId, R.categoryId", {
                replacements: {
                    subjectId: req.body.subjectId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(relations => {
                res.jsonp(relations);
            });
    });

    app.get('/admin/subjectCategoryPLevelRelation/settings/subjectId/:subjectId/categoryId/:categoryId', checkLogin);
    app.get('/admin/subjectCategoryPLevelRelation/settings/subjectId/:subjectId/categoryId/:categoryId', function (req, res) {
        Subject.getFilter({
                _id: req.params.subjectId
            })
            .then(o => {
                Category.getFilter({
                        _id: req.params.categoryId
                    })
                    .then(p => {
                        res.render('Server/processLevelSettingList.html', {
                            title: '>设置平行班类别>' + o.name + ">" + p.name,
                            user: req.session.admin,
                            subjectId: req.params.subjectId,
                            categoryId: req.params.categoryId
                        });
                    });
            });
    });

    app.post('/admin/subjectCategoryPLevelRelation/search', checkLogin);
    app.post('/admin/subjectCategoryPLevelRelation/search', function (req, res) {
        var result = {};
        model.db.sequelize.query("select * from subjectCategoryPLevelRelations \
            where isDeleted=false and subjectId=:subjectId and categoryId=:categoryId order by createdDate, _id", {
                replacements: {
                    subjectId: req.body.subjectId,
                    categoryId: req.body.categoryId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(levels => {
                res.jsonp(levels);
            });
    });


    app.post('/admin/processLevel/add', checkLogin);
    app.post('/admin/processLevel/add', function (req, res) {
        SubjectCategoryPLevelRelation.getFilter({
                processLevel: req.body.name,
                subjectId: req.body.subjectId,
                categoryId: req.body.categoryId
            })
            .then(function (level) {
                if (level) {
                    res.jsonp({
                        error: "同名进度已经存在！"
                    });
                } else {
                    SubjectCategoryPLevelRelation.create({
                            processLevel: req.body.name,
                            subjectId: req.body.subjectId,
                            categoryId: req.body.categoryId,
                            createdBy: req.session.admin._id
                        })
                        .then(function (result) {
                            if (result) {
                                res.jsonp(result);
                            }
                        });
                }
            });
    });

    app.post('/admin/processLevel/edit', checkLogin);
    app.post('/admin/processLevel/edit', function (req, res) {
        SubjectCategoryPLevelRelation.getFilter({
                processLevel: req.body.name,
                subjectId: req.body.subjectId,
                categoryId: req.body.categoryId,
                _id: {
                    $ne: req.body.id
                }
            })
            .then(function (level) {
                if (level) {
                    res.jsonp({
                        error: "同名进度已经存在！"
                    });
                } else {
                    SubjectCategoryPLevelRelation.update({
                            processLevel: req.body.name
                        }, {
                            where: {
                                _id: req.body.id
                            }
                        })
                        .then(function () {
                            res.jsonp({
                                sucess: true
                            });
                        });
                }
            });
    });

    app.post('/admin/processLevel/delete', checkLogin);
    app.post('/admin/processLevel/delete', function (req, res) {
        SubjectCategoryPLevelRelation.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (result) {
                res.jsonp({
                    sucess: true
                });
            });
    });

}