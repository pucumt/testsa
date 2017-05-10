var newStudent = true,
    editStudent,
    orderId;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter/order";
    });

    $("#btnPay").on("click", function(e) {
        var orderId = $(e.currentTarget).attr("orderId");
        $("#bgBack").show();
        $("#pay-select").show();
    });
});


$("#pay-select .wechat").on("click", function(e) {
    $.get("/personalCenter/order/wechatpay/" + orderId, function(data) {
        if (data.error) {
            showAlert("生成付款码失败");
        } else {
            //location.href = data.url;
            $(".imgCode #imgCode").attr("src", data.imgCode);
            $(".imgCode").show();
            $(".personalCenter").hide();
        }
    });
});

$("#pay-select .zhifubao").on("click", function(e) {
    $.get("/personalCenter/order/zhifubaopay/" + orderId, function(data) {
        if (data.error) {
            showAlert("生成付款码失败");
        } else {
            //location.href = data.url;
            $(".imgCode #imgCode").attr("src", data.imgCode);
            $(".imgCode").show();
            $(".personalCenter").hide();
        }
    });
});

$("#bgBack").on("click", function(e) {
    $("#bgBack").hide();
    $("#pay-select").hide();
});