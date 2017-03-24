$(document).ready(function() {
    $("#btnAdminEnrollTrain").on("click", function(e) {
        location.href = "/admin/adminEnrollTrainList";
    });

    $("#btnAdminEnrollExam").on("click", function(e) {
        location.href = "/admin/adminEnrollExamList";
    });

    $("#btnTrainOrder").on("click", function(e) {
        location.href = "/admin/trainOrderList";
    });

    $("#btnExamOrder").on("click", function(e) {
        location.href = "/admin/examOrderList";
    });

    $("#btnRebate").on("click", function(e) {
        location.href = "/admin/rebateOrderList";
    });

    $("#btnChangeClass").on("click", function(e) {
        location.href = "/admin/changeClassList";
    });

});