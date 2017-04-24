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

//Html编码获取Html转义实体  
function htmlEncode(value) {
    return encodeURI(value);
    // return $('<div/>').text(value).html();
};
//Html解码获取Html实体  
function htmlDecode(value) {
    return decodeURI(value);
    // return $('<div/>').html(value).text();
};