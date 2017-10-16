$(document).ready(function () {
    $("#btnPay").hide();
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        //返回按钮
        location.href = "/enroll/class/" + $("#classId").val();
    });

    if ($("#disability").val()) {
        showAlert("您未达到本课程成绩要求，建议报名其他课程或咨询前台！", "", function (e) {
            location.href = "/enroll/class/" + $("#classId").val();
        });
    } else {
        if ($("#isTimeDuplicated").val() == "true") {
            //时间冲突，简单提醒
            showAlert("上课时间跟已报课程有冲突了!", "", function (e) {});
        }

        $("#btnPay").show();
        renderData();
    }
    $(".enroll .exam-detail #coupon").on("change blur", setPrice);
});

function renderData() {
    var filter = {
        classId: $("#classId").val(),
        studentId: $("#studentId").val(),
        originalUrl: "/enroll/order?classId=" + $("#classId").val() + "&studentId=" + $("#studentId").val()
    };
    selfAjax("post", "/studentInfo/coupon", filter, function (data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            var couponList = [];
            if (data.student && data.student.discount && data.student.discount != 100) {
                couponList.push({
                    id: 0,
                    name: (data.student.discount / 100) + "折",
                    entity: data.student
                });
            }
            if (data.assigns && data.assigns.length > 0) {
                data.assigns.forEach(function (assign) {
                    couponList.push({
                        id: assign._id,
                        name: assign.couponName,
                        entity: assign
                    });
                });
            }
            if (couponList.length > 0) {
                $(".enroll .exam-detail .coupon").show();
                var d = $(document.createDocumentFragment());
                couponList.forEach(function (entity) {
                    var option = $("<option value='" + entity.id + "'>" + entity.name + "</option>");
                    option.data("obj", entity.entity)
                    d.append(option);
                });
                $(".enroll .exam-detail .coupon #coupon").append(d);
                setPrice();
            } else {
                setPrice();
            }
        }
    });
};

function setPrice() {
    var tranClass = $(".enroll .exam-detail .exam-list .exam-card").data("obj");
    var price = parseFloat(tranClass.materialPrice);
    var coupon = $('.enroll .exam-detail .coupon #coupon').find("option:selected");
    if (coupon.length > 0) {
        var entity = coupon.data("obj");
        if (coupon.val() == "0") {
            price = parseFloat(tranClass.trainPrice) * entity.discount / 100 + price;
        } else {
            price = parseFloat(tranClass.trainPrice) - entity.reducePrice + price;
        }
    } else {
        price = parseFloat(tranClass.trainPrice) + price;
    }
    $(".enroll .exam-detail .total").text(price.toFixed(2));
};

$("#btnPay").on("click", function (e) {
    $("#bgBack").show();
    $("#pay-select").show();
});

function getOrderId(payWay, callback) {
    $("#btnPay").attr("disabled", "disabled");
    var filter = {
        classId: $("#classId").val(),
        studentId: $("#studentId").val(),
        coupon: $('.enroll .exam-detail .coupon #coupon').val(),
        payWay: payWay
    };
    filter.originalUrl = "/enroll/order?classId=" + filter.classId + "&studentId=" + filter.studentId;
    selfAjax("post", "/enroll/pay", filter, function (data) {
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
                    if ("你已经报过名了，将跳转到订单页!" == data.error) {
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

$("#pay-select .wechat").on("click", function (e) {
    getOrderId("6", function (orderId) {
        selfAjax("get", "/personalCenter/order/wechatpay/" + orderId, null, function (data) {
            $("#pay-select").hide();
            if (data.error) {
                showAlert("生成付款码失败");
            } else {
                if (data.url) {
                    location.href = data.url;
                } else {
                    showAlert("生成付款码失败");
                }
                //location.href = data.url;
                // $(".imgCode #imgCode").attr("src", data.imgCode);
                // $(".imgCode").show();
                // $("#bgBack").off("click");
                // $(".personalCenter").hide();
            }
        });
    });
});

$("#pay-select .zhifubao").on("click", function (e) {
    getOrderId("7", function (orderId) {
        selfAjax("get", "/personalCenter/order/zhifubaopay/" + orderId, null, function (data) {
            $("#pay-select").hide();
            if (data.error) {
                showAlert("生成付款码失败");
            } else {
                //location.href = data.url;
                $(".imgCode #imgCode").attr("src", data.imgCode);
                $(".imgCode").show();
                $("#bgBack").off("click");
                $(".personalCenter").hide();
            }
        });
    });
});

$("#bgBack").on("click", function (e) {
    $("#bgBack").hide();
    $("#pay-select").hide();
});