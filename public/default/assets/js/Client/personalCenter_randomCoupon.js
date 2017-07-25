var newStudent = true,
    editStudent;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter";
    });
    loadCoupons();
});

function loadCoupons() {
    selfAjax("post", "/personalCenter/randomCoupon/all", {
        originalUrl: "/personalCenter/randomCoupon"
    }, function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            if (data.length > 0) {
                renderCoupons(data);
            } else {
                $ul.text("还没有优惠券活动");
            }
        }
    });
};

var $ul = $("#Enroll-student .randomCouponList .student-list");

function renderCoupons(coupons) {
    if (coupons.length > 0) {
        var d = $(document.createDocumentFragment());
        coupons.forEach(function(coupon) {
            d.append('<li class="clearfix" id=' + coupon._id + '><span>' + coupon.name + '</span><button class="take pull-right">(点击领取)</button></li>');
        });
        $ul.append(d);
    }
};

$("#Enroll-student .randomCouponList .student-list").on("click", "li .take", function(e) {
    var obj = e.currentTarget;
    var id = $(obj).parent().attr("id");
    $("#Enroll-student li .take").attr("disabled", "disabled");
    console.log("click");
    selfAjax("post", "/personalCenter/randomCoupon/get", {
        originalUrl: "/personalCenter/randomCoupon",
        id: id
    }, function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }
            $("#Enroll-student li .take").removeAttr("disabled");
            if (data.sucess) {
                showAlert("抽取成功！", null, function() {
                    location.href = "/personalCenter/coupon";
                });
            } else {
                showAlert(data.error);
            }
        }
    });
});