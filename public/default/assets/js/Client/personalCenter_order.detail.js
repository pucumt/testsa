var newStudent = true,
    editStudent,
    orderId;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter/order";
    });

    $("#btnPay").on("click", function(e) {
        showAlert("如果退费将要收取6‰的手续费！", null, function() {
            $("#btnPay").attr("disabled", "disabled");
            $("#bgBack").show();
            $("#pay-select").show();
        });
    });

    if ($("#payway").val() == "7") {
        $("#pay-select .wechat").hide();
        $("#pay-select .zhifubao").show();
    } else if ($("#payway").val() == "6") {
        $("#pay-select .zhifubao").hide();
        $("#pay-select .wechat").show();
    }
});

$("#pay-select .wechat").on("click", function(e) {
    $("#pay-select").hide();
    selfAjax("get", "/personalCenter/order/wechatpay/" + $("#orderId").val(), null, function(data) {
        if (data.error) {
            showAlert("生成付款码失败");
        } else {
            if (data.url) {
                location.href = data.url;
                // showAlert("付款失败，请选择支付宝支付尝试", null, function() {
                //     $("#btnPay").removeAttr("disabled");
                //     $("#bgBack").hide();
                // });
            } else {
                $(".imgCode #imgCode").attr("src", data.imgCode);
                $(".imgCode").show();
            }
        }
    });
});

$("#pay-select .zhifubao").on("click", function(e) {
    $("#pay-select").hide();
    selfAjax("get", "/personalCenter/order/zhifubaopay/" + $("#orderId").val(), null, function(data) {
        if (data.error) {
            showAlert("生成付款码失败");
        } else {
            //location.href = data.url;
            if (data.imgCode == "") {
                showAlert("付款失败，请选择微信支付尝试", null, function() {
                    $("#btnPay").removeAttr("disabled");
                    $("#bgBack").hide();
                });
            } else {
                $(".imgCode #imgCode").attr("src", data.imgCode);
                $(".imgCode").show();
            }
        }
    });
});

$("#bgBack").on("click", function(e) {
    $("#bgBack").hide();
    $("#pay-select").hide();
    $(".imgCode").hide();
});