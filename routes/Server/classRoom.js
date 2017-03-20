var ClassRoom = require('../../models/classRoom.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin

module.exports = function(app) {
    app.get('/admin/classRoomList', checkLogin);
    app.get('/admin/classRoomList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        ClassRoom.getAll(null, page, {}, function(err, classRooms, total) {
            if (err) {
                classRooms = [];
            }
            res.render('Server/classRoomList.html', {
                title: '教室设置',
                user: req.session.user,
                classRooms: classRooms,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + classRooms.length) == total
            });
        });
    });

    app.post('/admin/classRoom/add', checkLogin);
    app.post('/admin/classRoom/add', function(req, res) {
        var classRoom = new ClassRoom({
            name: req.body.name,
            sCount: req.body.sCount,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea
        });

        classRoom.save(function(err, classRoom) {
            if (err) {
                classRoom = {};
            }
            res.jsonp(classRoom);
        });
    });

    app.post('/admin/classRoom/edit', checkLogin);
    app.post('/admin/classRoom/edit', function(req, res) {
        var classRoom = new ClassRoom({
            name: req.body.name,
            sCount: req.body.sCount,
            schoolId: req.body.schoolId,
            schoolArea: req.body.schoolArea
        });

        classRoom.update(req.body.id, function(err, classRoom) {
            if (err) {
                classRoom = {};
            }
            res.jsonp(classRoom);
        });
    });

    app.post('/admin/classRoom/delete', checkLogin);
    app.post('/admin/classRoom/delete', function(req, res) {
        ClassRoom.delete(req.body.id, function(err, classRoom) {
            if (err) {
                res.jsonp({ error: err });
                return;
            }
            res.jsonp({ sucess: true });
        });
    });

    app.get('/admin/classRoomList/withoutpage', checkLogin);
    app.get('/admin/classRoomList/withoutpage', function(req, res) {
        ClassRoom.getAllWithoutPage({}, function(err, classRooms) {
            res.jsonp(classRooms);
        });
    });
}