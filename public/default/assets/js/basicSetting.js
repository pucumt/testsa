$(document).ready(function() {
    $("#btnAdmin").on("click", function(e) {
        location.href = "/admin/adminList";
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

    $("#btnCategory").on("click", function(e) {
        location.href = "/admin/categoryList";
    });

    $("#btnSubject").on("click", function(e) {
        location.href = "/admin/subjectList";
    });
});