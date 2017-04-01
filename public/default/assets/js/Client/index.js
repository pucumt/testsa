$(document).ready(function() {
    $("#btnExam").on("click", function(e) {
        location.href = "/enrollExam";
    });
    $("#btnClass").on("click", function(e) {
        location.href = "/enrollClass";
    });
});