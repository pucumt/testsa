$(document).ready(function() {
    $("#left_btnTrainClass").on("click", function(e) {
        location.href = "/admin/trainClassList";
    });

    $("#left_btnCategory").on("click", function(e) {
        location.href = "/admin/categoryList";
    });

    $("#left_btnSubject").on("click", function(e) {
        location.href = "/admin/subjectList";
    });

    $("#left_btnAttribute").on("click", function(e) {
        location.href = "/admin/classAttributeList";
    });

    $("#left_btnExamClass").on("click", function(e) {
        location.href = "/admin/examClassList";
    });

    $("#left_btnExamCategory").on("click", function(e) {
        location.href = "/admin/examCategoryList";
    });

    $("#left_btnEnrollProcess").on("click", function(e) {
        location.href = "/admin/enrollProcess";
    });

    $("#left_btnChangeEnd").on("click", function(e) {
        location.href = "/admin/changeEnd";
    });

    $("#left_btnRollCallProcess").on("click", function(e) {
        location.href = "/admin/rollCallConfigureList";
    });
});