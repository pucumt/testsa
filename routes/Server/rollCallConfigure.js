var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    RollCallConfigure = model.rollCallConfigure,
    Year = model.year,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    // function checkIsConfigureExist() {
    //     //just used for the first run, and then be comments
    //     RollCallConfigure.get().then(function(configure) {
    //         if (!configure) {
    //             configure = new RollCallConfigure({
    //                 yearId: global.currentYear._id,
    //                 yearName: global.currentYear.name,
    //                 sequence: global.currentYear.sequence
    //             });
    //             configure.save();
    //         }
    //     });
    // };

    // checkIsConfigureExist();

    app.get('/admin/rollCallConfigureList', checkLogin);
    app.get('/admin/rollCallConfigureList', function (req, res) {
        res.render('Server/rollCallConfigureList.html', {
            title: '>设置点名课程的年度',
            user: req.session.admin
        });
    });

    app.post('/admin/rollCallConfigure/edit', checkLogin);
    app.post('/admin/rollCallConfigure/edit', function (req, res) {
        //req.body.status,
        RollCallConfigure.getFilter({})
            .then(function (configure) {
                var option = {
                    yearId: req.body.yearId,
                    yearName: req.body.yearName,
                    attributeId: req.body.attributeId,
                    sequence: req.body.sequence
                }
                RollCallConfigure.update(option, {
                        where: {}
                    })
                    .then(function () {
                        res.jsonp(option);
                    });
            });
    });

    app.post('/admin/rollCallConfigureList/search', checkLogin);
    app.post('/admin/rollCallConfigureList/search', function (req, res) {
        model.db.sequelize.query("select R.yearId, A._id, A.name from classAttributes A join yearAttributeRelations R \
        on R.attributeId=A._id where R.isDeleted=false and A.isDeleted=false ", {
                replacements: {},
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (classAttributes) {
                Year.getFilters({})
                    .then(function (years) {
                        RollCallConfigure.getFilter({})
                            .then(function (configure) {
                                res.jsonp({
                                    configure: configure,
                                    years: years,
                                    classAttributes: classAttributes
                                });
                            });
                    });
            })
            .catch(err => {
                console.log('err');
            });
    });
}