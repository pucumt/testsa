var hideConfirmForm;
window.showAlert = function(msg, title, callback) {
    $('#confirmModal').show();
    $('#confirmModal #confirmModalLabel').text(title || "提示");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("确定");
    $('#confirmModal #btnConfirmSave').hide();

    hideConfirmForm = function() {
        callback && callback();
        $('#confirmModal').hide();
    };
};

window.showComfirm = function(msg, title, hidecallback) {
    $('#confirmModal').show();
    $('#confirmModal #confirmModalLabel').text(title || "确认");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("取消");
    $('#confirmModal #btnConfirmSave').show();

    hideConfirmForm = function() {
        hidecallback && hidecallback();
        $('#confirmModal').hide();
    };
};

$(document).ready(function() {
    $("#btnExam").on("click", function(e) {
        location.href = "/enrollExam";
    });
    $("#btnClass").on("click", function(e) {
        location.href = "/enrollClass";
    });
    $("#btnPersonal").on("click", function(e) {
        location.href = "/personalCenter";
    });

    $("#btnOpenId").on("click", function(e) {
        location.href = "/openIdGeter";
    });

    $('#confirmModal #btnConfirmSave').on("click", function(e) {

    });

    $('#confirmModal .modal-footer .btn-default').on("click", function(e) {
        hideConfirmForm();
    });

});

window.selfAjax = function(method, url, filter, callback) {
    loading();
    $[method](
        url,
        filter,
        function(data) {
            callback(data);
            hideLoading();
        }
    );
};

window.loading = function() {
    $("#loadingIndicator").modal({ backdrop: 'static', keyboard: false });
};

window.hideLoading = function() {
    $("#loadingIndicator").modal('hide');
};