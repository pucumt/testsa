var originalUrl, payUrl;
$(document).ready(function () {
    originalUrl = "/enroll/order?classId=" + $("#classId").val();
    payUrl = "/enroll/pay";

    $("#btnPay").hide();
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        //返回按钮
        location.href = "/enroll/class/" + $("#classId").val();
    });

    $("#btnPay").show();
    renderData();

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

$("#bgBack").on("click", function (e) {
    $("#bgBack").hide();
    $("#pay-select").hide();
});