$(document).ready(function() {
    $("#left_btnAccount").on("click", function(e) {
        location.href = "/admin/studentAccountList";
    });

    $("#left_btnStudent").on("click", function(e) {
        location.href = "/admin/studentsList";
    });

    $("#left_btnCard").on("click", function(e) {
        location.href = "/admin/cardSearch";
    });

    $("#left_btnScoreInput").on("click", function(e) {
        location.href = "/admin/ScoreInput";
    });

    $("#btnExamCategory").on("click", function(e) {
        location.href = "/admin/examCategoryList";
    });

});