$(document).ready(function() {
    $("#btnenroll").on("click", function(e) {
        location.href = "/admin/trainClassList";
    });

    $("#btnSchool").on("click", function(e) {
        location.href = "/admin/schoolAreaList";
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