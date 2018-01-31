var model = require("../../model.js"),
    request = require('request'),
    settings = model.db.config,
    sha1 = require('sha1'),
    auth = require("./auth"),
    SystemConfigure = model.systemConfigure,
    moment = require('moment'),
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

    // use token to get ticket
    function ticketFunc(access_token, req, res) {
        getticket(access_token, function (error, response, body) {
            debugger;
            var data = JSON.parse(body);
            if (response.statusCode == 200 && (!data.errcode)) {
                var ticket = data.ticket,
                    timestamp = Date.parse(new Date()) / 1000,
                    nonceStr = "qwertyuiop",
                    key = "jsapi_ticket=" + ticket + "&noncestr=" + nonceStr + "&timestamp=" + timestamp + "&url=" + req.body.clientUrl,
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
    };

    // if isExist just need to update token
    function saveToken(access_token, isExist) {
        var jsonToken = {
            token: access_token,
            date: moment().format()
        };
        if (isExist) {
            SystemConfigure.update({
                value: JSON.stringify(jsonToken)
            }, {
                where: {
                    "key": "token"
                }
            })
        } else {
            SystemConfigure.create({
                "key": "token",
                value: JSON.stringify(jsonToken)
            });
        }
    };

    app.post('/signature/get', checkLogin);
    app.post('/signature/get', function (req, res) {
        // check is time over 1 hour, 
        SystemConfigure.getFilter({
            "key": "token"
        }).then(configures => {
            var token = "";
            if (configures) {
                var jsonToken = JSON.parse(configures.value);
                if (moment(jsonToken.date).add(1, "hours").isAfter(moment())) {
                    ticketFunc(jsonToken.token, req, res);
                    return;
                }
            }
            if (token == "") {
                getToken(function (error, response, body) {
                    debugger;
                    var data = JSON.parse(body);
                    if (response.statusCode == 200 && (!data.errcode)) {
                        var access_token = data.access_token;
                        // save to db
                        saveToken(access_token, configures);

                        // get ticket and response to client
                        ticketFunc(access_token, req, res);
                    } else {
                        res.jsonp({
                            error: "没有授权token!"
                        });
                    }
                });
            }
        });
    });

    // app.get('/signature/chiSign', checkLogin);
    app.post('/signature/chiSign', function (req, res) {
        var appId = settings.dAppID,
            appKey = "151678364400002b",
            secretKey = "97a9221c21f636b10b14ba2d5d77d343",
            timestamp = (Date.parse(new Date()) / 1000).toString(),
            rawSignStr = [appKey, secretKey, timestamp],
            signStr = "";

        rawSignStr.sort()
            .forEach(x => {
                signStr += x;
            });
        console.log(signStr);
        var signature = sha1(signStr);
        var returnObj = {
            appId: appId,
            timestamp: timestamp,
            signature: signature
        };
        console.log(returnObj);
        res.jsonp(returnObj);
    });
};