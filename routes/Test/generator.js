var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto');

var fs = require('fs');  
// 加载编码转换模块  
var iconv = require('iconv-lite');   
  
function readFile(file1, file2, callback){  
    fs.readFile(file1, function(err, data){  
        if(err)  
            console.log("读取文件fail " + err);  
        else{  
            var str = iconv.decode(data, 'utf-8');  
            callback(str);
            fs.appendFile(file2, str, function(err){  
                if(err)  
                    console.log("fail " + err);  
                else  
                    console.log("写入文件ok");  
            }); 
        }  
    });  
} 


module.exports = function(app) {
    app.get('/generator', function(req, res) {
        res.render('Test/generator.html', {
            title: '自动生成'
        });
    });
     app.post('/generator', function(req, res) {
         //generate models
         //generate routes
         //generate views
         //generate public js
         readFile();
        //writeFile(file);
        res.render('Test/generator.html', {
            title: '生成成功'
        });
    });
};

