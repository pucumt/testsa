$(document).ready(function() {
    $(".enroll.personalCenter .account .reset").on("click", function(e) {
        location.href = "/Teacher/personalCenter/resetPWD";
    });
    $(".enroll.personalCenter .rollCall").on("click", function(e) {
        location.href = "/Teacher/rollCallClasses";
    });
    $(".enroll.personalCenter .makeUp").on("click", function(e) {
        location.href = "/Teacher/rollCallClasses/extra";
    });

    $("#btnExit").on("click", function(e) {
        location.href = "/Teacher/personalCenter/exit";
    });
});