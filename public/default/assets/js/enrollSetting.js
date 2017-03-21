$(document).ready(function() {
    $("#btnAdminEnrollTrain").on("click", function(e) {
        location.href = "/admin/adminEnrollTrainList";
    });

    $("#btnAdminEnrollExam").on("click", function(e) {
        location.href = "/admin/adminEnrollExamList";
    });

    $("#btnTeacher").on("click", function(e) {
        location.href = "/admin/teacherList";
    });

    $("#btnYear").on("click", function(e) {
        location.href = "/admin/yearList";
    });
});