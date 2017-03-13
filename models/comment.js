var markdown = require('markdown').markdown;
var mongoose = require('./db');
var db = mongoose.connection;

var commentSchema = new mongoose.Schema({
    postid: String,
    name: String,
    date: Date,
    content: String
}, {
    collection: 'comments'
});

var commentModel = mongoose.model('Comments', commentSchema);



function Comment(option) {
  this.option = option;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
 var newComment = new commentModel(this.option);

    newComment.save(function(err, comment) {
        if (err) {
            return callback(err);
        }
        callback(null, comment);

    });
};

//一次获取十篇文章
Comment.getByPost = function(postid, page, callback) {
    var total = 0;
    // commentModel.count({postid: postid}).exec(function(err, count){
    //             total = count;
    //         });

    commentModel.find({postid: postid})
            .sort({
                _id: -1
            })
            .exec(function(err, comments){
                callback(null, comments, total);
            });
};
