var newStudent = true,
    editStudent;

$(document).ready(function () {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter/exam";
    });

    $(".btnEnroll").on("click", function (e) {
        location.href = "/enrollClass";
    });

    $("#btnPay").on("click", function (e) {
        $("#btnPay").attr("disabled", "disabled");
        $("#bgBack").show();
        $("#pay-select").show();
    });

    $("#bgBack").on("click", function (e) {
        $("#bgBack").hide();
        $("#pay-select").hide();
    });


    $("#pay-select .wechat").on("click", function (e) {
        $("#pay-select").hide();
        selfAjax("get", "/personalCenter/order/wechatpay/" + $("#orderId").val(), null, function (data) {
            if (data.error) {
                showAlert("生成付款码失败");
            } else {
                if (data.url) {
                    location.href = data.url;
                } else {
                    $(".imgCode #imgCode").attr("src", data.imgCode);
                    $(".imgCode").show();
                }
            }
        });
    });

    $(".price").on("click", ".score .grade", function (e) {
        location.replace("/score/");
    });

    if ($(".orderList ul li .title").text().indexOf("小升初") < 0) {
        // 不是小升初测试，隐藏等级显示
        // $(".orderList ul li .gradeS1").hide();
    }
});