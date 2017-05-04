var newStudent = true,
    editStudent;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter/exam";
    });

    $(".btnEnroll").on("click", function(e) {
        location.href = "/enrollClass";
    });
});