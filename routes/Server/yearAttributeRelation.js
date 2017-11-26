var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Year = model.year,
    YearAttributeRelation = model.yearAttributeRelation,
    ClassAttribute = model.classAttribute,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    function newYearAttributeRelation(yearId, attributeId) {
        return YearAttributeRelation.create({
            yearId: yearId,
            attributeId: attributeId
        });
    };

    app.get('/admin/year/settings/:id', checkLogin);
    app.get('/admin/year/settings/:id', function (req, res) {
        Year.getFilter({
            _id: req.params.id
        }).then(function (year) {
            if (year) {
                res.render('Server/yearAttributeRelationList.html', {
                    title: '>' + year.name + '>年度学期',
                    user: req.session.admin,
                    yearId: req.params.id
                });
            }
        });
    });

    app.post('/admin/yearAttributeRelation/save', checkLogin);
    app.post('/admin/yearAttributeRelation/save', function (req, res) {
        var newAttributes = JSON.parse(req.body.newAttributes),
            removeAttributes = JSON.parse(req.body.removeAttributes),
            yearId = req.body.yearId,
            pArray = [];

        if (newAttributes.length > 0) {
            newAttributes.forEach(function (attributeId) {
                pArray.push(newYearAttributeRelation(yearId, attributeId));
            });
        }

        if (removeAttributes.length > 0) {
            pArray.push(YearAttributeRelation.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    yearId: yearId,
                    attributeId: {
                        $in: removeAttributes
                    }
                }
            }));
        }

        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/yearAttributeRelationList/search', checkLogin);
    app.post('/admin/yearAttributeRelationList/search', function (req, res) {
        var result = {};

        var p0 = YearAttributeRelation.getFilters({
                yearId: req.body.yearId
            })
            .then(function (relations) {
                result.relations = relations;
            });

        var p1 = ClassAttribute.getFilters({})
            .then(function (classAttributes) {
                result.classAttributes = classAttributes;
            });

        Promise.all([p0, p1])
            .then(function () {
                res.jsonp(result);
            });
    });
}