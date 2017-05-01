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
    $(".enroll.personalCenter .randomCoupon").on("click", function(e) {
        location.href = "/personalCenter/randomCoupon";
    });
    $("#btnExit").on("click", function(e) {
        location.href = "/personalCenter/exit";
    });

    renderRandomCoupon();
});

function renderRandomCoupon() {
    $.post("/coupon/isRandomCouponExist", { originalUrl: "/personalCenter" },
        function(data) {
            if (data) {
                if (data.notLogin) {
                    location.href = "/login";
                    return;
                }
                if (data.sucess) {
                    $(".enroll.personalCenter .randomCoupon").show();
                    return;
                }
            }
        });
};