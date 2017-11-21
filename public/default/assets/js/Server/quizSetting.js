$(document).ready(function () {
    $("#left_btnQuiz").on("click", function (e) {
        location.href = "/admin/quizList";
    });
    $("#left_btnProcessLevel").on("click", function (e) {
        location.href = "/admin/processLevelList";
    });

    $(".admin-header .menu-top #header_btnQuiz").addClass("active");
});