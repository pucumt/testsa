$(document).ready(function () {

    function getGradeName() {
        switch ($("#grade").val()) {
            case "1":
                return "基础班"
            case "2":
                return "培优班"
            case "3":
                return "通中班"
            case "4":
                return "尖子班"
        }
    }

    $(".bgGrade").load(function () {
        $(".imgHeight").height(parseInt($(".bgGrade").height()) * 0.6);
    });
    $.ajax({
        url: "/signature/get", //微信官方签名方法
        type: "POST",
        data: {
            clientUrl: location.href
        },
        success: function (data) {
            // data.debug = true;
            data.jsApiList = ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone"]; // 
            wx.config(data);

            wx.ready(function () {
                var option = {
                    title: '百分百' + getGradeName() + '录取通知书', // 分享标题
                    desc: '我已经被百分百' + getGradeName() + '录取', // 分享描述
                    link: 'http://bfbeducation.com' + location.pathname, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: 'http://bfbeducation.com/default/assets/images/' + $("#grade").val() + '.png', // 分享图标
                };
                wx.onMenuShareTimeline({
                    title: option.title, // 分享标题
                    link: option.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: option.imgUrl, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                        // window.alert("cancel!");
                    }
                });
                wx.onMenuShareAppMessage({
                    title: option.title, // 分享标题
                    desc: option.desc, // 分享描述
                    link: option.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: option.imgUrl, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                        // window.alert("cancel!");
                    }
                });
                wx.onMenuShareQQ({
                    title: option.title, // 分享标题
                    desc: option.desc, // 分享描述
                    link: option.link, // 分享链接
                    imgUrl: option.imgUrl, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                wx.onMenuShareWeibo({
                    title: option.title, // 分享标题
                    desc: option.desc, // 分享描述
                    link: option.link, // 分享链接
                    imgUrl: option.imgUrl, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                wx.onMenuShareQZone({
                    title: option.title, // 分享标题
                    desc: option.desc, // 分享描述
                    link: option.link, // 分享链接
                    imgUrl: option.imgUrl, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
            });

            wx.error(function (res) {
                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            });
        }
    });
});