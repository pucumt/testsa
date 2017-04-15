var settings = require('../settings')
var mongoose = require('mongoose');
mongoose.connect('mongodb://weple001:zwp001@' + settings.host + ':' + settings.port + '/100db');
//mongoose.connect('mongodb://weple001:zwp001@ds047075.mongolab.com:47075/100db');
module.exports = mongoose;