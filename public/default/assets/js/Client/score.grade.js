$(document).ready(function () {
    $(".bgGrade").load(function () {
        $(".imgHeight").height(parseInt($(".bgGrade").height()) * 0.6);
    });
});