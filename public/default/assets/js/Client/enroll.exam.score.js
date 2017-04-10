$(document).ready(function() {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/enrollExam";
    });
    $(".btnEnroll").on("click", function(e) {
        location.href = "/enrollClass";
    });
});