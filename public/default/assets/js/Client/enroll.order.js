var originalUrl, payUrl;
$(document).ready(function () {
    originalUrl = "/enroll/order?classId=" + $("#classId").val() + "&studentId=" + $("#studentId").val();
    payUrl = "/enroll/pay";

    $("#btnPay").hide();
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        //返回按钮
        location.href = "/enroll/class/" + $("#classId").val();
    });

    if ($("#disability").val()) {
        showAlert("您未达到本课程成绩要求，建议报名其他课程或咨询前台！", "", function (e) {
            location.href = "/enroll/class/" + $("#classId").val();
        });
    } else {
        if ($("#isTimeDuplicated").val() == "true") {
            //时间冲突，简单提醒
            showAlert("上课时间跟已报课程有冲突了!", "", function (e) {});
        }

        $("#btnPay").show();
        renderData();
    }
    $(".enroll .exam-detail #coupon").on("change blur", setPrice);
});


$("#pay-select .wechat").on("click", function (e) {
    getOrderId("6", function (orderId) {
        selfAjax("get", "/personalCenter/order/wechatpay/" + orderId, null, function (data) {
            $("#pay-select").hide();
            if (data.error) {
                showAlert("生成付款码失败");
            } else {
                if (data.url) {
                    location.href = data.url;
                } else {
                    showAlert("生成付款码失败");
                }
            }
        });
    });
});

$("#pay-select .zhifubao").on("click", function (e) {
    getOrderId("7", function (orderId) {
        selfAjax("get", "/personalCenter/order/zhifubaopay/" + orderId, null, function (data) {
            $("#pay-select").hide();
            if (data.error) {
                showAlert("生成付款码失败");
            } else {
                //location.href = data.url;
                $(".imgCode #imgCode").attr("src", data.imgCode);
                $(".imgCode").show();
                $("#bgBack").off("click");
                $(".personalCenter").hide();
            }
        });
    });
});

$("#bgBack").on("click", function (e) {
    $("#bgBack").hide();
    $("#pay-select").hide();
});