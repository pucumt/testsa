var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainOrder").addClass("active");
    $("#btnReturn").attr("href", "/admin/trainOrderList");

    renderOrderDetail();
});

//------------search funfunction
function getPayway(way) {
    switch (way) {
        case 0:
            return "现金";
        case 1:
            return "刷卡";
        case 2:
            return "转账";
        case 8:
            return "支付宝";
        case 9:
            return "微信";
        case 6:
            return "在线";
        case 7:
            return "在线";
    }
    return "";
};

function renderOrderDetail() {
    $.post("/admin/adminEnrollTrain/getorder", { id: $("#id").val() }, function(data) {
        if (data) {
            if (!data.error) {
                $(".mainModal .studentName").html(data.studentName);
                $(".mainModal .trainName").html(data.trainName);
                $(".mainModal .orderDate").html(moment(data.orderDate).format("YYYY-MM-DD HH:mm"));
                $(".mainModal .totalPrice").html(data.totalPrice);
                $(".mainModal .realMaterialPrice").html(data.realMaterialPrice);
                $(".mainModal .rebatePrice").html(data.rebatePrice);
                $(".mainModal .payWay").html(getPayway(data.payWay));
                $(".mainModal .comment").html(data.comment || "");
                $(".mainModal .fromId").html(data.fromId || "");
            } else {
                showAlert(data.error);
            }
        }
    });
};
//------------end