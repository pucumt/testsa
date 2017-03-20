$(document).ready(function() {
    $("#btnTrainClass").on("click", function(e) {
        location.href = "/admin/trainClassList";
    });

    $("#btnExamClass").on("click", function(e) {
        location.href = "/admin/examClassList";
    });

    $("#btnGrade").on("click", function(e) {
        location.href = "/admin/gradeList";
    });

    $("#btnClassroom").on("click", function(e) {
        location.href = "/admin/classRoomList";
    });

    $("#btnTeacher").on("click", function(e) {
        location.href = "/admin/teacherList";
    });

    $("#btnYear").on("click", function(e) {
        location.href = "/admin/yearList";
    });
});