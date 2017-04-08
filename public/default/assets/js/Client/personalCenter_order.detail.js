var newStudent = true,
    editStudent;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter/order";
    });

    $("#btnPay").on("click", function(e) {
        var orderId = $(e.currentTarget).attr("orderId");
        $.post("/personalCenter/order/pay", {
            id: orderId
        }, function(data) {
            if (data.error) {
                showAlert("生成付款码失败");
            } else {}
        });
    });
});