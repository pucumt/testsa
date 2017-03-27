$(document).ready(function() {
    $("#left_btnAdmin").on("click", function(e) {
        location.href = "/admin/adminList";
    });

    $("#left_btnSchool").on("click", function(e) {
        location.href = "/admin/schoolAreaList";
    });

    $("#left_btnGrade").on("click", function(e) {
        location.href = "/admin/gradeList";
    });

    $("#left_btnClassroom").on("click", function(e) {
        location.href = "/admin/classRoomList";
    });

    $("#left_btnExamroom").on("click", function(e) {
        location.href = "/admin/examRoomList";
    });

    $("#left_btnTeacher").on("click", function(e) {
        location.href = "/admin/teacherList";
    });

    $("#left_btnYear").on("click", function(e) {
        location.href = "/admin/yearList";
    });
});