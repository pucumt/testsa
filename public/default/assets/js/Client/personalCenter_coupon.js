var newStudent = true,
    editStudent;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter";
    });
    loadCoupons();
});

function loadCoupons() {
    $.post("/personalCenter/coupon/all", {
        originalUrl: "/personalCenter/coupon"
    }, function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            if (data.length > 0) {
                renderCoupons(data);
            } else {
                $ul.text("还没有优惠券");
            }
        }
    });
};

var $ul = $("#Enroll-student .couponlist .student-list");

function renderCoupons(coupons) {
    if (coupons.length > 0) {
        var d = $(document.createDocumentFragment());
        d.append('<li class="header"><span class="studentName">学生</span><span class="">优惠券</span></li>');
        coupons.forEach(function(coupon) {
            d.append('<li><span class="studentName">' + coupon.studentName +
                '</span><span class="">' + coupon.couponName + '</span></li>');
        });
        $ul.append(d);
    }
};