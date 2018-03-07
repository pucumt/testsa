$(document).ready(function () {
    $("#left_btnAdminEnrollExam").on("click", function (e) {
        location.href = "/admin/adminEnrollExamList";
    });

    $("#left_btnRebate").on("click", function (e) {
        location.href = "/admin/rebateExamOrderList";
    });

    $("#left_btnPayway").on("click", function (e) {
        location.href = "/admin/paywayExamOrderList";
    });

    $("#left_btnRebateway").on("click", function (e) {
        location.href = "/admin/rebatewayExamOrderList";
    });

    $("#left_btnExamOrder").on("click", function (e) {
        location.href = "/admin/examOrderList";
    });

    $(".admin-header .menu-top #header_btnEnrollExam").addClass("active");
});