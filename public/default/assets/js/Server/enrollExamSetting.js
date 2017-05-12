$(document).ready(function() {
    $("#left_btnAdminEnrollExam").on("click", function(e) {
        location.href = "/admin/adminEnrollExamList";
    });

    $("#left_btnExamOrder").on("click", function(e) {
        location.href = "/admin/examOrderList";
    });
});