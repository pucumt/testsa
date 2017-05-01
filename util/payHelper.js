var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto'),
    parseString = require('xml2js').parseString,
    settings = require('../settings');

function toxml(nodes) {
    var xmlContent = "<xml>";
    nodes.forEach(function(node) {
        xmlContent = xmlContent + "<" + node.key + "><![CDATA[" + node.value + "]]></" + node.key + ">"
    });
    xmlContent = xmlContent + "</xml>";
    return xmlContent;
};

function mysubstr(body, sstart, sstop) {
    var i = body.indexOf(sstart),
        subBody = body.substr(i),
        j = subBody.indexOf(sstop),
        resultBody = subBody.substr(23, j - 23);

    return resultBody;
};

function myJSSubstr(body, sstart, sstop) {
    var i = body.indexOf(sstart),
        subBody = body.substr(i),
        j = subBody.indexOf(sstop),
        resultBody = subBody.substr(19, j - 19);

    return resultBody;
};

var Pay = {
    pay: function(payParas, res) {
        var paras = [],
            strPay = "body=" + payParas.body + "&mch_create_ip=" + settings.create_ip + "&mch_id=" + settings.mch_id + "&nonce_str=bfbeducation&notify_url=" + settings.notify_Url + "&out_trade_no=" +
            payParas.out_trade_no + "&service=pay.weixin.native&total_fee=" + payParas.total_fee + "&key=" + settings.key; //e6371d360d79eb9fa4c25c7f91d2bc6b

        paras.push({ key: 'body', value: payParas.body });
        paras.push({ key: 'mch_create_ip', value: settings.create_ip });
        paras.push({ key: 'mch_id', value: settings.mch_id }); //101560037142
        paras.push({ key: 'nonce_str', value: 'bfbeducation' });
        paras.push({ key: 'notify_url', value: settings.notify_Url });
        paras.push({ key: 'out_trade_no', value: payParas.out_trade_no });
        paras.push({ key: 'service', value: 'pay.weixin.native' });
        paras.push({ key: 'total_fee', value: payParas.total_fee });

        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();

        paras.push({ key: 'sign', value: sign });
        var data = toxml(paras);
        var options = {
            hostname: 'pay.swiftpass.cn',
            port: 443,
            path: '/pay/gateway',
            method: 'POST'
        };

        var reqPay = https.request(options, (resPay) => {
            //console.log('statusCode:', resPay.statusCode);
            //console.log('headers:', resPay.headers);

            resPay.on('data', (d) => {
                var body = d.toString(),
                    imgCode = mysubstr(body, "<code_img_url><![CDATA[", "]]></code_img_url>");

                res.jsonp({
                    imgCode: imgCode
                });
            });
        });

        reqPay.on('error', (e) => {
            console.error(e);
        });
        reqPay.write(data);
        reqPay.end();
    },
    jsPay: function(payParas, res) {
        var paras = [],
            strPay = "body=" + payParas.body + "&mch_create_ip=" + settings.create_ip + "&mch_id=" + settings.mch_id + "&nonce_str=bfbeducation&notify_url=" + settings.notify_Url + "&out_trade_no=" +
            payParas.out_trade_no + "&service=pay.weixin.jspay&total_fee=" + payParas.total_fee + "&key=" + settings.key; //e6371d360d79eb9fa4c25c7f91d2bc6b

        paras.push({ key: 'body', value: payParas.body });
        paras.push({ key: 'mch_create_ip', value: settings.create_ip });
        paras.push({ key: 'mch_id', value: settings.mch_id }); //101560037142
        paras.push({ key: 'nonce_str', value: 'bfbeducation' });
        paras.push({ key: 'notify_url', value: settings.notify_Url }); //'http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp' });
        paras.push({ key: 'out_trade_no', value: payParas.out_trade_no });
        paras.push({ key: 'service', value: 'pay.weixin.jspay' });
        paras.push({ key: 'sub_openid', value: '' });
        paras.push({ key: 'total_fee', value: payParas.total_fee });

        // var xml = "<xml><bank_type><![CDATA[CMB_CREDIT]]></bank_type><charset><![CDATA[UTF-8]]></charset><fee_type><![CDATA[CNY]]></fee_type><is_subscribe><![CDATA[N]]></is_subscribe><mch_id><![CDATA[7551000001]]></mch_id><nonce_str><![CDATA[1492745387968]]></nonce_str><openid><![CDATA[oywgtuJBTzG1wlOfagWqP32XfmKo]]></openid><out_trade_no><![CDATA[58f977e88facf57b7d76edcf]]></out_trade_no><out_transaction_id><![CDATA[4009762001201704217784370419]]></out_transaction_id><pay_result><![CDATA[0]]></pay_result><result_code><![CDATA[0]]></result_code><sign><![CDATA[52F349C5F88A61DC397FEDA4B34777C3]]></sign><sign_type><![CDATA[MD5]]></sign_type><status><![CDATA[0]]></status><sub_appid><![CDATA[wxce38685bc050ef82]]></sub_appid><sub_is_subscribe><![CDATA[N]]></sub_is_subscribe><sub_openid><![CDATA[oHmbkt-sH80mkPChhgoGYZmj-boE]]></sub_openid><time_end><![CDATA[20170421112947]]></time_end><total_fee><![CDATA[1]]></total_fee><trade_type><![CDATA[pay.weixin.jspay]]></trade_type><transaction_id><![CDATA[7551000001201704215167208590]]></transaction_id><version><![CDATA[2.0]]></version></xml>";
        // parseString(xml, function(err, resultObject) {
        //     var result = resultObject.xml;
        //     var keys = Object.getOwnPropertyNames(result).sort(),
        //         strResult = "";
        //     keys.forEach(function(key) {
        //         var v = result[key];
        //         if ("sign" != key && "key" != key) {
        //             strResult = strResult + key + "=" + v + "&";
        //         }
        //     });
        //     strResult = strResult + "key=" + settings.key;
        //     var md5 = crypto.createHash('md5'),
        //         sign = md5.update(strResult).digest('hex').toUpperCase();
        // });

        //52F349C5F88A61DC397FEDA4B34777C3 --result
        //79046B911A869AC54DEF1C4DAA3444F9 --old
        var md5 = crypto.createHash('md5'),
            sign = md5.update(strPay).digest('hex').toUpperCase();

        paras.push({ key: 'sign', value: sign });
        var data = toxml(paras);
        var options = {
            hostname: 'pay.swiftpass.cn',
            port: 443,
            path: '/pay/gateway',
            method: 'POST'
        };

        var reqPay = https.request(options, (resPay) => {
            //console.log('statusCode:', resPay.statusCode);
            //console.log('headers:', resPay.headers);

            resPay.on('data', (d) => {
                var body = d.toString(),
                    imgCode = myJSSubstr(body, "<token_id><![CDATA[", "]]></token_id>");
                res.jsonp({ token: imgCode });
            });
        });

        reqPay.on('error', (e) => {
            console.error(e);
        });
        reqPay.write(data);
        reqPay.end();
    }
};

module.exports = Pay;