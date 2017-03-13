var Post = require('../../models/post.js');
var Post = require('../../models/post.js');

module.exports = function(app) {
    app.get('/', function(req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        Post.get20(null, page, {
            isPassed: true
        }, function(err, posts, total) {
            if (err) {
                posts = [];
            }
            //test code
            posts = [{
                shortid: 1,
                title: "test title",
                price: "100",
                imgFile: "...",
                post: "test  post"
            },
            {
                shortid: 2,
                title: "test title",
                price: "100",
                imgFile: "...",
                post: "test  post"
            }];
            res.render('Client/index.html', {
                title: '主页',
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 20 + posts.length) == total,
                user: req.session.user
            });
        });
    });
};