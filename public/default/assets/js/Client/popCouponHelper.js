$("#btnPay").on("click", function (e) {
    if ($("#bfbRule").prop('checked')) {
        $("#bgBack").show();
        $("#pay-select").show();
    } else {
        showAlert("请先同意《百分百学校学员缴费、退费、请假、补课管理办法》");
    }
});

function getCouponIds() {
    var coupon = $('.enroll .exam-detail .coupon .couponlist #coupon'),
        ids = [];
    coupon.each(function (index) {
        if (this.checked) {
            ids.push($(this).val());
        }
    });
    return JSON.stringify(ids);
};

function getOrderId(payWay, callback) {
    $("#btnPay").attr("disabled", "disabled");
    var filter = {
        classId: $("#classId").val(),
        studentId: $("#studentId").val(),
        couponIds: getCouponIds(),
        payWay: payWay
    };
    filter.originalUrl = originalUrl;
    selfAjax("post", payUrl, filter, function (data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }
            $("#btnPay").removeAttr("disabled");
            if (data.error) {
                $("#bgBack").show();
                $("#pay-select").hide();
                showAlert(data.error, null, function () {
                    $("#bgBack").hide();
                    if (data.error.indexOf("将跳转到订单页") > 0) {
                        location.href = "/personalCenter/order";
                    }
                });
                return;
            }
            if (data.orderId) {
                callback(data.orderId);
            }
        }
    });
};

function renderData() {
    var filter = {
        classId: $("#classId").val(),
        originalUrl: originalUrl
    };
    selfAjax("post", "/studentInfo/coupon", filter, function (data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }
            // var couponList = [];
            if (data.student && data.student.discount && data.student.discount != 100) {
                $(".enroll .exam-detail .coupon").show();
                $(".enroll .exam-detail .coupon .couponlist").append('<div class="checkbox"><label><input name="discount" disabled id="discount" type="checkbox" checked value="' + data.student.discount + '" />' + (data.student.discount / 100) + '折</label></div>');
            }
            if (data.assigns && data.assigns.length > 0) {
                $(".enroll .exam-detail .coupon").show();
                var d = $(document.createDocumentFragment());

                data.assigns.forEach(function (assign) {
                    d.append('<div class="checkbox"><label><input name="coupon" id="coupon" type="checkbox" price=' + assign.reducePrice + ' value="' + assign._id + '" />' + assign.couponName + '(' + assign.reducePrice + ')元' + '</label></div>');
                });
                $(".enroll .exam-detail .coupon .couponlist").append(d);
            }

            setPrice();
        }
    });
};

function setPrice() {
    var tranClass = $(".enroll .exam-detail .exam-list .exam-card").data("obj");
    var price = parseFloat(tranClass.materialPrice),
        trainPrice = parseFloat(tranClass.trainPrice),
        discount = parseFloat($(".coupon .couponlist #discount").val() || 100);
    var coupon = $('.enroll .exam-detail .coupon .couponlist #coupon');
    coupon.each(function (index) {
        if (this.checked) {
            trainPrice = trainPrice - parseFloat($(this).attr("price"));
        }
    });

    // 折扣
    if (discount != 100) {
        trainPrice = trainPrice * discount / 100;
    }
    // 加上教材费
    price = trainPrice + price;
    $(".enroll .exam-detail .total").text(price.toFixed(2));
};

$('.enroll .exam-detail .coupon .couponlist')
    .on("change", "#coupon", function (e) {
        setPrice();
    });