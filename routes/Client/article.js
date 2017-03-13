var Post = require('../../models/post.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    shortid = require('shortid'),
    htmlCode = require('../../util/htmlCode.js');

module.exports = function(app) {
    app.get('/article/:id', function(req, res) {
        //查询并返回id的文章
        Post.getOne(req.params.id, true, function(err, post, comments) {
            if (err) {
                post = {};
            }
            post = {
                shortid: 1,
                title: "百分百音标课——四年级必修",
                price: "100",
                imgFile: "...",
                post: "test  post"
            };
            res.render('Client/article.html', {
                title: '文章',
                post: post
            });
        });
    });

    app.post('/article/:id', checkLogin)
    app.post('/article/:id', function(req, res) {
        var currentUser = req.session.user,
            comment = new Comment({
                postid: req.params.id,
                content: htmlCode.htmlEscape(req.body.content),
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