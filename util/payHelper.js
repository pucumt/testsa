var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto');

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
            strPay = "body=" + payParas.body + "&mch_create_ip=127.0.0.1&mch_id=7551000001&nonce_str=bfbeducation&notify_url=http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp&out_trade_no=" +
            payParas.out_trade_no + "&service=pay.weixin.native&total_fee=" + payParas.total_fee + "&key=9d101c97133837e13dde2d32a5054abb"; //e6371d360d79eb9fa4c25c7f91d2bc6b

        paras.push({ key: 'body', value: payParas.body });
        paras.push({ key: 'mch_create_ip', value: '127.0.0.1' });
        paras.push({ key: 'mch_id', value: '7551000001' }); //101560037142
        paras.push({ key: 'nonce_str', value: 'bfbeducation' });
        paras.push({ key: 'notify_url', value: 'http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp' });
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
            strPay = "body=" + payParas.body + "&mch_create_ip=127.0.0.1&mch_id=7551000001&nonce_str=bfbeducation&notify_url=http://www.dushidao.com/admin/pay/notify&out_trade_no=" +
            payParas.out_trade_no + "&service=pay.weixin.jspay&total_fee=" + payParas.total_fee + "&key=9d101c97133837e13dde2d32a5054abb"; //e6371d360d79eb9fa4c25c7f91d2bc6b

        paras.push({ key: 'body', value: payParas.body });
        paras.push({ key: 'mch_create_ip', value: '127.0.0.1' });
        paras.push({ key: 'mch_id', value: '7551000001' }); //101560037142
        paras.push({ key: 'nonce_str', value: 'bfbeducation' });
        paras.push({ key: 'notify_url', value: 'http://www.dushidao.com/admin/pay/notify' }); //'http://zhangwei.dev.swiftpass.cn/demo/TenpayResult.asp' });
        paras.push({ key: 'out_trade_no', value: payParas.out_trade_no });
        paras.push({ key: 'service', value: 'pay.weixin.jspay' });
        paras.push({ key: 'sub_openid', value: '' });
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