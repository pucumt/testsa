var markdown = require('markdown').markdown;
var mongoose = require('./db');
var db = mongoose.connection;

var courseSchema = new mongoose.Schema({
	shortid: String,
	title: String,
	price: String,
	imgFile: String,
	courseContent: String,
	courseTeacher: String,
	courseStartDate: Date,
	courseEndDate: Date,
	courseTime: String,
	courseAddress: String,
	isFull: Boolean,
	totalCount: Number,
	enrollCount: Number,
	isPassed: Boolean,
	createdDate: Date,
	createdBy: String,
	isDeleted: Boolean,
	deletedBy: String,
	lastChangedDate: Date,
	lastChangedBy: String
}, {
	collection: 'courses'
});

var courseModel = mongoose.model('Course', courseSchema);


function Course(option)
{
	this.option = option;
}

module.exports = Course;

//存储一篇文章及其相关信息
Course.prototype.save = function(callback)
{
	var newCourse = new courseModel(this.option);

	newCourse.save(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);

		//db.close();
	});
};

//一次获取十篇文章
Course.get20 = function(name, page, filter, callback)
{
	var query = courseModel.count(filter);
	query.exec(function(err, count)
	{
		query.find().sort({
			_id: -1
		})
            .skip((page - 1) * 20)
            .limit(20)
            .exec(function(err, courses)
            {
            	callback(null, courses, count);
            });
	});
};

//获取一篇文章
Course.getOne = function(shortid, callback)
{
	//打开数据库
	courseModel.findOne({
		shortid: shortid
	}).exec(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);
	});
};

//返回原始发表的内容（markdown 格式）
Course.edit = function(name, day, title, callback) { };

//更新一篇文章及其相关信息
Course.prototype.update = function(callback)
{
	courseModel.update({
		shortid: this.option.shortid
	}, this.option).exec(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);
	});
};

//通过一篇文章
Course.pass = function(shortid, callback)
{
	courseModel.update({
		shortid: shortid
	}, {
		isPassed: true
	}).exec(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);
	});
};

//删除一篇文章
Course.delete = function(shortid, callback)
{
	courseModel.remove({
		shortid: shortid
	}).exec(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);
	});
};

//删除一篇文章
Course.deleteById = function(id, callback)
{
	courseModel.remove({
		_id: id
	}).exec(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);
	});
};

//通过一篇文章
Course.suggest = function(shortid, callback)
{
	courseModel.update({
		shortid: shortid
	}, {
		isSuggest: true
	}).exec(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);
	});
};


//通过一篇文章
Course.unsuggest = function(shortid, callback)
{
	courseModel.update({
		shortid: shortid
	}, {
		isSuggest: false
	}).exec(function(err, course)
	{
		if (err)
		{
			return callback(err);
		}
		callback(null, course);
	});
};

//返回通过标题关键字查询的所有文章信息
Course.search = function(keyword, callback) { };