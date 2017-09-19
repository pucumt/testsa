const model = require('./model.js');

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});

model.sync().then(function () {
    console.log('init db ok.');
    process.exit(0);
});