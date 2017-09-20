var model = require("../../model.js"),
    ClassRoom = model.classRoom,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/classRoomList', checkLogin);
    app.get('/admin/classRoomList', function (req, res) {
        res.render('Server/classRoomList.html', {
            title: '>教室设置',
            user: req.session.admin
        });
    });

    app.get('/admin/batchAddClassRoom', checkLogin);
    app.get('/admin/batchAddClassRoom', function (req, res) {
        res.render('Server/batchAddClassRoom.html', {
            title: '>批量添加教室',
            user: req.session.admin
        });
    });

    app.post('/admin/classRoom/add', checkLogin);
    app.post('/admin/classRoom/add', function (req, res) {
        ClassRoom.create({
                name: req.body.name,
                sCount: req.body.sCount,
                schoolId: req.body.schoolId,
                schoolArea: req.body.schoolArea
            })
            .then(function (classRoom) {
                res.jsonp(classRoom);
            });
    });

    app.post('/admin/classRoom/edit', checkLogin);
    app.post('/admin/classRoom/edit', function (req, res) {
        ClassRoom.update({
            name: req.body.name,
            sCount: req.body.sCount,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (classRoom) {
            res.jsonp(classRoom);
        });
    });

    app.post('/admin/classRoom/delete', checkLogin);
    app.post('/admin/classRoom/delete', function (req, res) {
        ClassRoom.update({
            isDeleted: true
        }, {
            where: {
                _id: req.body.id
            }
        }).then(function (classRoom) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.get('/admin/classRoomList/withoutpage', checkLogin);
    app.get('/admin/classRoomList/withoutpage', function (req, res) {
        ClassRoom.getFilters({}).then(function (classRooms) {
            res.jsonp(classRooms);
        });
    });
    app.post('/admin/classRoomList/search', checkLogin);
    app.post('/admin/classRoomList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        ClassRoom.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                classRooms: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + result.rows.length) == result.count
            });
        });
    });
}