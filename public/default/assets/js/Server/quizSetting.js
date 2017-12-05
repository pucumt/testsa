$(document).ready(function () {
    $("#left_btnQuiz").on("click", function (e) {
        location.href = "/admin/quizList";
    });
    $("#left_btnClassEnroll").on("click", function (e) {
        location.href = "/admin/classEnrollList";
    });

    $("#left_btnQuizInput").on("click", function (e) {
        location.href = "/admin/quizScoreList";
    });

    $(".admin-header .menu-top #header_btnQuiz").addClass("active");
});