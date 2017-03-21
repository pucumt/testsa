$(document).ready(function() {
    $("#btnTrainClass").on("click", function(e) {
        location.href = "/admin/trainClassList";
    });

    $("#btnCategory").on("click", function(e) {
        location.href = "/admin/categoryList";
    });

    $("#btnSubject").on("click", function(e) {
        location.href = "/admin/subjectList";
    });

    $("#btnExamClass").on("click", function(e) {
        location.href = "/admin/examClassList";
    });

    $("#btnExamCategory").on("click", function(e) {
        location.href = "/admin/examCategoryList";
    });
});