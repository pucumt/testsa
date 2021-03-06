var isNew = true;

$(document).ready(function () {
    $("#left_btnTrainOrder").addClass("active");
});

var payWay = "0";
$("#btnPay").on("click", function (e) {
    var id = $("#order").data("obj");
    $(":input[name='payWay']").each(function (index) {
        if (this.checked) {
            payWay = $(this).val();
        }
    });
    switch (payWay) {
        case "0":
        case "1":
        case "2":
        case "8":
        case "9":
            showConfirm("确定已收订单" + id + "的款项吗？");
            break;
    }
});

$("#btnConfirmSave").on("click", function (e) {
    var id = $("#order").data("obj");
    selfAjax("post", "/admin/adminEnrollTrain/pay", {
        id: id,
        payWay: payWay
    }, function (data) {
        if (data.sucess) {
            showAlert("支付成功");
            $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                location.href = "/admin/trainOrderList";
            });
        } else {
            showAlert(data.error);
        }
    });
});