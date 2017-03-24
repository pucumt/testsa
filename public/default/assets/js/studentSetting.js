$(document).ready(function() {
    $("#left_btnAccount").on("click", function(e) {
        location.href = "/admin/studentAccountList";
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