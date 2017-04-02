var Post = require('../../models/post.js'),
    Comment = require('../../models/comment.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    shortid = require('shortid');

module.exports = function(app) {
    app.get('/article/:id', function(req, res) {
        //查询并返回第 page 页的 20 篇文章
        Post.getOne(req.params.id, true, function(err, post, comments) {
            if (err) {
                post = {};
            }
            if (comments == null) {
                comments = [];
            }
            res.render('Client/article', {
                title: '文章',
                post: post,
                comments: comments,
                user: req.session.admin
            });
        });
    });

    app.post('/article/:id', checkLogin)
    app.post('/article/:id', function(req, res) {
        var currentUser = req.session.admin,
            comment = new Comment({
                postid: req.params.id,
                content: req.body.content,
                name: currentUser.name,
                date: new Date()
            });
        comment.save(function(err) {
            if (err) {
                return res.redirect('/');
            }
            res.redirect('/article/' + comment.option.postid); //发表成功跳转到主页
        });
    });
}