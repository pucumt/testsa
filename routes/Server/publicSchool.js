var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    PublicSchool = model.publicSchool,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/publicSchool', checkLogin);
    app.get('/admin/publicSchool', function (req, res) {
        res.render('Server/publicSchoolList.html', {
            title: '>校区设置',
            user: req.session.admin
        });
    });


    app.post('/admin/publicSchool/add', checkLogin);
    app.post('/admin/publicSchool/add', function (req, res) {
        PublicSchool.create({
                name: req.body.name,
                cityAreaId: req.body.cityAreaId,
                cityArea: req.body.cityArea,
                sequence: req.body.sequence,
                createdBy: req.session.admin._id
            })
            .then(function (publicSchool) {
                res.jsonp(publicSchool);
            });
    });

    app.post('/admin/publicSchool/edit', checkLogin);
    app.post('/admin/publicSchool/edit', function (req, res) {
        PublicSchool.update({
                name: req.body.name,
                cityAreaId: req.body.cityAreaId,
                cityArea: req.body.cityArea,
                sequence: req.body.sequence,
                deletedBy: req.session.admin._id,
                updatedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (teacher) {
                res.jsonp(teacher);
            });
    });

    app.post('/admin/publicSchool/delete', checkLogin);
    app.post('/admin/publicSchool/delete', function (req, res) {
        PublicSchool.update({
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

    app.post('/admin/publicSchool/rawSearch', checkLogin);
    app.post('/admin/publicSchool/rawSearch', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        PublicSchool.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    publicSchools: result.rows,
                    total: result.count,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
                });
            });
    });

    app.post('/admin/publicSchool/search', checkLogin);
    app.post('/admin/publicSchool/search', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var strSqlMiddle = " from publicSchools S join publicSchoolGradeRelations R on R.publicSchoolId=S._id \
        join publicGrades G on R.publicGradeId=G._id \
        where S.isDeleted=false and R.isDeleted=false and G.isDeleted=false ",
            strSql1 = "select count(0) as count ",
            strSql2 = "select S.* ",
            replacements = {};
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            strSqlMiddle += " and S.name like :name ";
            replacements.name = "%" + req.body.name.trim() + "%";
        }
        if (req.body.cityAreaId) {
            strSqlMiddle += " and S.cityAreaId=:cityAreaId ";
            replacements.cityAreaId = req.body.cityAreaId;
        }
        if (req.body.grade) {
            strSqlMiddle += " and G.name=:grade ";
            replacements.grade = req.body.grade;
        }

        var offset = ((page - 1) * pageSize);
        strSql2 += strSqlMiddle + " order by S.createdDate desc, S._id desc LIMIT " + offset + ", " + pageSize;
        strSql1 += strSqlMiddle;

        model.db.sequelize.query(strSql1, {
                replacements: replacements,
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (counts) {
                if (counts && counts.length > 0) {
                    var total = counts[0].count;
                    model.db.sequelize.query(strSql2, {
                            replacements: replacements,
                            type: model.db.sequelize.QueryTypes.SELECT
                        })
                        .then(schools => {
                            res.jsonp({
                                publicSchools: schools,
                                total: total,
                                page: page,
                                isFirstPage: (page - 1) == 0,
                                isLastPage: (offset + schools.length) == total
                            });
                        });
                }
            });
    });

    app.get('/admin/publicSchool/settings/:id', checkLogin);
    app.get('/admin/publicSchool/settings/:id', function (req, res) {
        PublicSchool.getFilter({
                _id: req.params.id
            })
            .then(function (publicSchool) {
                if (publicSchool) {
                    res.render('Server/publicSchoolGradeRelationList.html', {
                        title: '>' + publicSchool.name + '>学校类别',
                        user: req.session.admin,
                        publicSchoolId: req.params.id
                    });
                }
            });
    });
}