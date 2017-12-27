$(document).ready(function () {
    $("#left_btnAdminEnrollTrain").on("click", function (e) {
        location.href = "/admin/adminEnrollTrainList";
    });

    $("#left_btnTrainOrder").on("click", function (e) {
        location.href = "/admin/trainOrderList";
    });

    $("#left_btnRebate").on("click", function (e) {
        location.href = "/admin/rebateOrderList";
    });

    $("#left_btnPayway").on("click", function (e) {
        location.href = "/admin/paywayOrderList";
    });

    $("#left_btnRebateway").on("click", function (e) {
        location.href = "/admin/rebatewayOrderList";
    });

    $("#left_btnChangeClass").on("click", function (e) {
        location.href = "/admin/changeClassList";
    });

    $("#left_btnWrongCancel").on("click", function (e) {
        location.href = "/admin/wrongCancelList";
    });

    $(".admin-header .menu-top #header_btnEnroll").addClass("active");
});