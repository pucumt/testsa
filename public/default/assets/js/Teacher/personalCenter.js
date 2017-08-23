$(document).ready(function () {
    $(".enroll.personalCenter .account .reset").on("click", function (e) {
        location.href = "/Teacher/personalCenter/resetPWD";
    });
    $(".enroll.personalCenter .rollCall").on("click", function (e) {
        location.href = "/Teacher/rollCallClasses?type=r"; // 点名
    });
    $(".enroll.personalCenter .makeUp").on("click", function (e) {
        location.href = "/Teacher/rollCallClasses/extra";
    });
    $(".enroll.personalCenter .homework").on("click", function (e) {
        location.href = "/Teacher/rollCallClasses?type=h"; // 作业
    });
    $("#btnExit").on("click", function (e) {
        location.href = "/Teacher/personalCenter/exit";
    });
});