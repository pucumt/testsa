var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainOrder").addClass("active");
});

var payWay = "0";
$("#btnPay").on("click", function(e) {
    var entity = $("#order").data("obj");
    $(":input[name='payWay']").each(function(index) {
        if (this.checked) {
            payWay = $(this).val();
        }
    });
    switch (payWay) {
        case "0":
        case "1":
        case "2":
            showComfirm("确定已收订单" + entity._id + "的款项吗？");
            break;
        case "9":
            $.post("/admin/adminEnrollTrain/payCode", {
                id: entity._id
            }, function(data) {
                if (data.error) {
                    showAlert("生成付款码失败");
                } else {
                    $('#myModalLabel').text("微信扫码支付");
                    $('#myModal .modal-body img').attr('src', data.imgCode);
                    $('#myModal').modal({ backdrop: 'static', keyboard: false });
                }
            });
            break;
    }
});

$("#btnConfirmSave").on("click", function(e) {
    var entity = $("#order").data("obj");
    $.post("/admin/adminEnrollTrain/pay", {
        id: entity._id,
        payWay: payWay
    }, function(data) {
        if (data.sucess) {
            showAlert("支付成功");
        } else {
            showAlert(data.error);
        }
    });
});