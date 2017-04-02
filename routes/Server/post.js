var Post = require('../../models/post.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    htmlCode = require('../../util/htmlCode.js');

module.exports = function(app) {
    app.get('/admin/postList', checkLogin);
    app.get('/admin/postList', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Post.get20(null, page, {}, function(err, posts, total) {
            if (err) {
                posts = [];
            }
            res.render('Server/postList', {
                title: '爆料列表',
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 20 + posts.length) == total
            });
        });
    });

    app.get('/admin/post', checkLogin);
    app.get('/admin/post', function(req, res) {
        res.render('Server/post', {
            title: '发表',
            user: req.session.admin
        });
    });

    app.post('/admin/post', checkLogin);
    app.post('/admin/post', function(req, res) {
        var currentUser = req.session.admin,
            post = new Post({
                shortid: req.body.shortid,
                title: req.body.title,
                price: req.body.price,
                imgFile: req.body.img,
                linkAddr: req.body.linkAddr,
                post: req.body.post,
                recordBy: currentUser.name,
                recordDate: new Date()
            });
        post.save(function(err) {
            if (err) {
                return res.redirect('/');
            }
            res.redirect('/'); //发表成功跳转到主页
        });
    });

    app.get('/admin/post/pass/:id', checkLogin);
    app.get('/admin/post/pass/:id', function(req, res) {
        Post.pass(req.params.id, function() {
            res.redirect('/admin/postList'); //发表成功跳转到主页
        });
    });

    app.get('/admin/post/suggest/:id', checkLogin);
    app.get('/admin/post/suggest/:id', function(req, res) {
        Post.suggest(req.params.id, function() {
            res.redirect('/admin/postList'); //发表成功跳转到主页
        });
    });

    app.get('/admin/post/unsuggest/:id', checkLogin);
    app.get('/admin/post/unsuggest/:id', function(req, res) {
        Post.unsuggest(req.params.id, function() {
            res.redirect('/admin/postList'); //发表成功跳转到主页
        });
    });

    app.get('/admin/post/delete/:id', checkLogin);
    app.get('/admin/post/delete/:id', function(req, res) {
        Post.delete(req.params.id, function() {
            res.redirect('/admin/postList'); //发表成功跳转到主页
        });
    });

    app.get('/admin/post/:id', checkLogin);
    app.get('/admin/post/:id', function(req, res) {
        Post.getOne(req.params.id, false, function(err, post) {
            if (err) {
                post = {};
            }
            post.post = htmlCode.htmlUnescape(post.post);
            res.render('Server/post', {
                title: '文章',
                post: post,
                user: req.session.admin,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.post('/admin/post/:id', checkLogin);
    app.post('/admin/post/:id', function(req, res) {
        var currentUser = req.session.admin,
            post = new Post({
                shortid: req.params.id,
                title: req.body.title,
                price: req.body.price,
                imgFile: req.body.img,
                linkAddr: req.body.linkAddr,
                post: htmlCode.htmlEscape(req.body.post)
            });
        post.update(function(err) {
            if (err) {
                return res.redirect('/');
            }
            res.redirect('/'); //发表成功跳转到主页
        });
    });
}