var originalUrl, payUrl;
$(document).ready(function () {
    originalUrl = "/enroll/original/order?classId=" + $("#classId").val() + "&studentId=" + $("#studentId").val() + "&orderId=" + $("#orderId").val();
    payUrl = "/enroll/original/pay";

    $("#btnPay").hide();
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        var href = "/enroll/originalclass/id/" + $("#classId").val() + "/student/" + $("#studentId").val();
        if ($("#orderId").val() != "") {
            href += "?orderId=" + $("#orderId").val();
        }
        location.href = href;
    });
    if ($("#notOriginal").val()) {
        showAlert("本课程是老班升报，您不符合要求，请等待后续课程！", "", function (e) {
            var href = "/enroll/originalclass/id/" + $("#classId").val() + "/student/" + $("#studentId").val();
            if ($("#orderId").val() != "") {
                href += "?orderId=" + $("#orderId").val();
            }
            location.href = href;
        });
    } else if ($("#disability").val()) {
        showAlert("本课程成绩要求" + $("#disability").val() + "分，根据您的考试成绩，建议报名其他课程或咨询前台！", "", function (e) {
            var href = "/enroll/originalclass/id/" + $("#classId").val() + "/student/" + $("#studentId").val();
            if ($("#orderId").val() != "") {
                href += "?orderId=" + $("#orderId").val();
            }
            location.href = href;
        });
    } else {
        if ($("#isTimeDuplicated").val() == "true") {
            //时间冲突，简单提醒
            showAlert("上课时间跟已报课程有冲突了!", "", function (e) {});
        }

        $("#btnPay").show();
        renderData(originalUrl);
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