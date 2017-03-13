var markdown = require('markdown').markdown;
var mongoose = require('./db');
var db = mongoose.connection;
var Comment = require('./comment.js')

var postSchema = new mongoose.Schema({
	shortid: String,
	title: String,
	price: String,
	imgFile: String,
	post: String,
	isSuggest: Boolean,
	isPassed: Boolean,
	sugDate: Date,
	suggestBy: String,
	passedDate: Date,
	passedBy: String,
	recordDate: Date,
	recordBy: String,
	linkAddr: String,
	suggestType: String,
	up: Number,
	down: Number,
	fromWeb: String,
	fromId: String
}, {
	collection: 'posts'
});

var postModel = mongoose.model('Post', postSchema);


function Post(option)
{
	this.option = option;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback)
{
	var newPost = new postModel(this.option);

	newPost.save(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, post);

		//db.close();
	});
};

//一次获取十篇文章
Post.get20 = function(name, page, filter, callback)
{
	var query = postModel.count(filter);
	query.exec(function(err, count)
	{
		query.find().sort({
			_id: -1
		})
            .skip((page - 1) * 20)
            .limit(20)
            .exec(function(err, posts)
            {
            	callback(null, posts, count);
            });
	});
};

Post.getsuggest = function(filter, callback)
{
	var query = postModel.find(filter)
        .sort({
        	_id: -1
        })
        .exec(function(err, posts)
        {
        	callback(null, posts);
        });
};

//获取一篇文章
Post.getOne = function(shortid, includeComment, callback)
{
	//打开数据库
	postModel.findOne({
		shortid: shortid
	}).exec(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		var comments = [];
		if (includeComment)
		{
			Comment.getByPost(shortid, 1, function(err, comments, total)
			{
				comments = comments;
				callback(null, post, comments);
			});
		} else
		{
			callback(null, post, comments);
		}

	});
};

//返回原始发表的内容（markdown 格式）
Post.edit = function(name, day, title, callback) { };

//更新一篇文章及其相关信息
Post.prototype.update = function(callback)
{
	postModel.update({
		shortid: this.option.shortid
	}, this.option).exec(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, post);
	});
};

//通过一篇文章
Post.pass = function(shortid, callback)
{
	postModel.update({
		shortid: shortid
	}, {
		isPassed: true
	}).exec(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, post);
	});
};

//删除一篇文章
Post.delete = function(shortid, callback)
{
	postModel.remove({
		shortid: shortid
	}).exec(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, post);
	});
};

//删除一篇文章
Post.deleteById = function(id, callback)
{
	postModel.remove({
		_id: id
	}).exec(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, post);
	});
};

//通过一篇文章
Post.suggest = function(shortid, callback)
{
	postModel.update({
		shortid: shortid
	}, {
		isSuggest: true
	}).exec(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, post);
	});
};


//通过一篇文章
Post.unsuggest = function(shortid, callback)
{
	postModel.update({
		shortid: shortid
	}, {
		isSuggest: false
	}).exec(function(err, post)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, post);
	});
};


//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) { };