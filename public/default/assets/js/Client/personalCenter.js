$(document).ready(function() {
    $(".enroll.personalCenter .account .reset").on("click", function(e) {
        location.href = "/personalCenter/resetPWD";
    });
    $(".enroll.personalCenter .students").on("click", function(e) {
        location.href = "/personalCenter/students";
    });
    $(".enroll.personalCenter .coupon").on("click", function(e) {
        location.href = "/personalCenter/coupon";
    });
    $(".enroll.personalCenter .order").on("click", function(e) {
        location.href = "/personalCenter/order";
    });
    $(".enroll.personalCenter .exam").on("click", function(e) {
        location.href = "/personalCenter/exam";
    });
});