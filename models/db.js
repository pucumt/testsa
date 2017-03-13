var settings = require('../settings')
var mongoose = require('mongoose');
mongoose.connect('mongodb://'+settings.host+':'+ settings.port +'/'+settings.db);

module.exports = mongoose;