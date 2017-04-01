var Post = require('../../models/post.js');
var Post = require('../../models/post.js');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('Client/index.html', {
            title: '主页'
        });
    });
};