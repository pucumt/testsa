$(document).ready(function() {
    $("#left_btnAdminEnrollTrain").on("click", function(e) {
        location.href = "/admin/adminEnrollTrainList";
    });

    $("#left_btnAdminEnrollExam").on("click", function(e) {
        location.href = "/admin/adminEnrollExamList";
    });

    $("#left_btnTrainOrder").on("click", function(e) {
        location.href = "/admin/trainOrderList";
    });

    $("#left_btnExamOrder").on("click", function(e) {
        location.href = "/admin/examOrderList";
    });

    $("#left_btnRebate").on("click", function(e) {
        location.href = "/admin/rebateOrderList";
    });

    $("#left_btnChangeClass").on("click", function(e) {
        location.href = "/admin/changeClassList";
    });

});