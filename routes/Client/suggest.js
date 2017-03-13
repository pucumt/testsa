var Post = require('../../models/post.js');

module.exports = function(callback) {
	Post.getsuggest({isSuggest:true}, function(err, posts) {
            if (err) {
                posts = [];
            }
            callback(posts);
        });
}