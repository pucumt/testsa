$(document).ready(function() {
    $("#header_btnEnroll").on("click", function(e) {
        location.href = "/admin/adminEnrollTrainList";
    });
    $("#header_btnClass").on("click", function(e) {
        location.href = "/admin/trainClassList";
    });
    $("#header_btnStudent").on("click", function(e) {
        location.href = "/admin/studentAccountList";
    });
    $("#header_btnFinancial").on("click", function(e) {
        location.href = "/admin/schoolAreaList";
    });
    $("#header_btnBasic").on("click", function(e) {
        location.href = "/admin/schoolAreaList";
    });
});

window.getTrainOrderStatus = function(isSucceed) {
    switch (isSucceed) {
        case 1:
            return "已报名"
            break;
        case 9:
            return "已取消"
            break;
    }
};

window.showAlert = function(msg, title, isModal) {
    if (!isModal) {
        $('#confirmModal').modal({ backdrop: 'static', keyboard: false });
    }

    $('#confirmModal #confirmModalLabel').text(title || "提示");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("确定");
    $('#confirmModal #btnConfirmSave').hide();
};

window.showComfirm = function(msg, title, isModal) {
    if (!isModal) {
        $('#confirmModal').modal({ backdrop: 'static', keyboard: false });
    }
    $('#confirmModal #confirmModalLabel').text(title || "确认");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("取消");
    $('#confirmModal #btnConfirmSave').show();
};

window.setSelectEvent = function($selectBody, callback) {
    $selectBody.off("click").on("click", "tr", function(e) {
        var obj = e.currentTarget;
        var entity = $(obj).data("obj");
        callback(entity);
    });
};