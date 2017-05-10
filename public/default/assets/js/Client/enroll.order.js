$(document).ready(function() {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function(e) {
        if ($("#originalOrder").val()) {
            location.href = "/enroll/originalclass/" + $("#classId").val();
        } else {
            location.href = "/enroll/class/" + $("#classId").val();
        }
    });
    if ($("#notOriginal").val()) {
        showAlert("本课程是老班升报，您不符合要求，请等待后续课程！", "", function(e) {
            location.href = "/enroll/originalclass/" + $("#classId").val();
        });
    } else if ($("#disability").val()) {
        showAlert("本课程成绩要求" + $("#disability").val() + "分，根据您的考试成绩，建议报名其他课程或咨询前台！", "", function(e) {
            if ($("#originalOrder").val()) {
                location.href = "/enroll/originalclass/" + $("#classId").val();
            } else {
                location.href = "/enroll/class/" + $("#classId").val();
            }
        });
    } else {
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
    $.post("/studentInfo/coupon", filter, function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            var couponList = [];
            if (data.student && data.student.discount) {
                couponList.push({ id: 0, name: (data.student.discount / 100) + "折", entity: data.student });
            }
            if (data.assigns && data.assigns.length > 0) {
                data.assigns.forEach(function(assign) {
                    couponList.push({ id: assign._id, name: assign.couponName, entity: assign });
                });
            }
            if (couponList.length > 0) {
                $(".enroll .exam-detail .coupon").show();
                var d = $(document.createDocumentFragment());
                couponList.forEach(function(entity) {
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

$("#btnPay").on("click", function(e) {
    $("#bgBack").show();
    $("#pay-select").show();
});

function getOrderId(callback) {
    $("#btnPay").attr("disabled", "disabled");
    var filter = {
        classId: $("#classId").val(),
        studentId: $("#studentId").val(),
        coupon: $('.enroll .exam-detail .coupon #coupon').val()
    };
    filter.originalUrl = "/enroll/order?classId=" + filter.classId + "&studentId=" + filter.studentId;
    $.post("/enroll/pay", filter, function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }
            $("#btnPay").removeAttr("disabled");
            if (data.error) {
                $("#bgBack").show();
                $("#pay-select").hide();
                showAlert(data.error, null, function() {
                    $("#bgBack").hide();
                    if ("你已经报过名了，将跳转到订单支付页!" == data.error) {
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

$("#pay-select .wechat").on("click", function(e) {
    getOrderId(function(orderId) {
        $.get("/personalCenter/order/wechatpay/" + orderId, function(data) {
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

$("#pay-select .zhifubao").on("click", function(e) {
    getOrderId(function(orderId) {
        $.get("/personalCenter/order/zhifubaopay/" + orderId, function(data) {
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

$("#bgBack").on("click", function(e) {
    $("#bgBack").hide();
    $("#pay-select").hide();
});