var isNew = true;

$(document).ready(function() {
    $("#left_btnOtherReport").addClass("active");
});

$(".mainModal #InfoSearch #btnExportOrder1").on("click", function(e) {
    selfAjax("post", "/admin/export/otherOrder1", {}, function(data) {
        if (data && data.sucess) {
            location.href = "/admin/export/scoreTemplate?name=" + encodeURI("已支付被取消订单.xlsx");
        }
    });
});