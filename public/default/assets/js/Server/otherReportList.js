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

$(".mainModal #InfoSearch #btnExportRoll").on("click", function(e) {
    selfAjax("post", "/admin/export/rollCallList", {}, function(data) {
        if (data && data.sucess) {
            location.href = "/admin/export/scoreTemplate?name=" + encodeURI("out.xlsx");
        }
    });
});

$(".mainModal #InfoSearch #btnSetSuper").on("click", function(e) {
    selfAjax("post", "/admin/user/SetSuper", {}, function(data) {
        if (data && data.sucess) {
            showAlert("设置成功！");
        }
    });
});