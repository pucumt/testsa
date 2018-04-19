$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/enrollClass";
    });

    $(".enroll-submit #btnEnroll").on("click", function (e) {
        location.href = "/enroll/order?classId=" + $("#id").val();
    });
});