$("#btnPay").on("click", function (e) {
    if (getSelectCounts() > getLastCounts()) {
        showAlert("购买数量超出活动数量！");
    } else {
        $("#bgBack").show();
        $("#pay-select").show();
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
    var curSelect = $('.exam-detail .exams li.counts.active').data("obj");
    var filter = {
        classId: $("#classId").val(),
        examId: curSelect._id,
        count: $('.exam-detail .num_and_more .num_wrap #counts').val(),
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
            } else if (data.totalPrice == 0) {
                location.href = "/personalCenter/order";
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
    selfAjax("post", "/classInfo/examscoupon", filter, function (data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }
            // var couponList = [];
            if (data.exams && data.exams.length > 0) {
                var d = $(document.createDocumentFragment()),
                    isFirst = true;
                data.exams.forEach(function (exam) {
                    var $li = $('<li class="tag counts">' + exam.examName + '(' + exam.minScore + '元)' + '</li>');
                    d.append($li);
                    $li.data("obj", exam);
                    if (isFirst) {
                        $li.addClass("active");
                        isFirst = false;
                    }
                });
                $(".enroll .exam-detail .exams").append(d);
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
    var tranClass = $(".enroll .exam-detail .exam-list .exam-card").data("obj"),
        curSelect = $('.exam-detail .exams li.counts.active').data("obj"),
        singlePrice = curSelect.minScore,
        price = parseInt($('.exam-detail .num_and_more .num_wrap #counts').val()) * singlePrice;
    $('.exam-detail .exam-list .class-price .price').text('￥' + singlePrice);
    var coupon = $('.enroll .exam-detail .coupon .couponlist #coupon');
    coupon.each(function (index) {
        if (this.checked) {
            price = price - parseFloat($(this).attr("price"));
        }
    });
    if (price < 0) {
        price = 0;
    }
    $(".enroll .exam-detail .total").text(price.toFixed(2));
};

$('.enroll .exam-detail .coupon .couponlist')
    .on("change", "#coupon", function (e) {
        setPrice();
    });

$('.exam-detail .num_and_more .num_wrap .minus')
    .on("click", function (e) {
        var $num = $(this).parent().find("#counts");
        if ($num.val() != "1") {
            $num.val(parseInt($num.val()) - 1);
            setPrice();
        }
    });

$('.exam-detail .num_and_more .num_wrap .plus')
    .on("click", function (e) {
        var $num = $(this).parent().find("#counts"),
            num = parseInt($num.val());
        if (num < 200) {
            $num.val(num + 1);
            setPrice();
        }
    });

// 选项变化了
$('.exam-detail .exams')
    .on("click", "li.counts", function (e) {
        // remove active li
        // add active to cur li
        $('.exam-detail .exams li.counts.active').removeClass("active");
        $(this).addClass("active");
        setPrice();
    });

function getSelectCounts() {
    // get counts to check if there are enough counts to sell
    var count = $('.exam-detail .num_and_more .num_wrap #counts').val();
    if (count != "0" && $('.exam-detail .exams li.counts.active').length == 1) {
        return parseInt(count) * $('.exam-detail .exams li.counts.active').data("obj").minCount;
    }
    return 0;
};

function getLastCounts() {
    var tranClass = $(".enroll .exam-detail .exam-list .exam-card").data("obj"),
        lastCount = tranClass.totalStudentCount - tranClass.enrollCount;
    return lastCount;
};