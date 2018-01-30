var model = require("../../model.js"),
    request = require('request'),
    settings = model.db.config,
    sha1 = require('sha1'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    checkJSONLogin = auth.checkJSONLogin;

module.exports = function (app) {
    function getticket(access_token, callback) {
        var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=" + access_token;
        request.get({
                url: url,
            },
            callback
        );
    };

    function getToken(callback) {
        var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + settings.dAppID + "&secret=" + settings.dAppSecret;
        request.get({
                url: url,
            },
            callback
        );
    };

    app.get('/signature/get', checkLogin);
    app.get('/signature/get', function (req, res) {
        getToken(function (error, response, body) {
            debugger;
            var data = JSON.parse(body);
            if (response.statusCode == 200 && (!data.errcode)) {
                var access_token = data.access_token;
                getticket(access_token, function (error, response, body) {
                    debugger;
                    var data = JSON.parse(body);
                    if (response.statusCode == 200 && (!data.errcode)) {
                        var ticket = data.ticket,
                            timestamp = Date.parse(new Date()) / 1000,
                            url = 'http://bfbeducation.com/book/lesson/59b0ea4eba582520d58aeb38',
                            nonceStr = "qwertyuiop",
                            key = "jsapi_ticket=" + ticket + "&noncestr=" + nonceStr + "&timestamp=" + timestamp + "&url=" + url,
                            // sha1 = crypto.createHash('sha1'),
                            signature = sha1(key); //.digest('hex')
                        res.jsonp({
                            appId: settings.dAppID,
                            timestamp: timestamp,
                            signature: signature,
                            nonceStr: nonceStr
                        });
                    } else {
                        res.jsonp({
                            error: "没有授权getticket!"
                        });
                    }
                });
            } else {
                res.jsonp({
                    error: "没有授权token!"
                });
            }
        });
    });

    // app.get('/signature/chiSign', checkLogin);
    app.post('/signature/chiSign', function (req, res) {
        var appId = settings.dAppID,
            appKey = "151678364400002b",
            secretKey = "97a9221c21f636b10b14ba2d5d77d343",
            timestamp = Date.parse(new Date()) / 1000,
            signStr = appKey + secretKey + timestamp,
            // sha1 = crypto.createHash('sha1'),
            signature = sha1(signStr);

        res.jsonp({
            appId: appId,
            timestamp: timestamp,
            signature: signature
        });
    });
};