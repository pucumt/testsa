var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = '8Sw7ub1lHZV9xWAh6dt-m6JdqlkkEBHKVJuI3ndz'
qiniu.conf.SECRET_KEY = 'JNIoE-H7nsv0xxjd7-S-OXzVKl4GVCK3GHfGU1qZ'

module.exports = function() {
  var putPolicy = new qiniu.rs.PutPolicy("wpwebsite");
  return putPolicy.token();
}