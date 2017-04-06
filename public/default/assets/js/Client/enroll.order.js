$(document).ready(function() {
    renderData();
    $(".enroll .exam-detail #coupon").on("change blur", setPrice);
});

function renderData() {
    var filter = {
        classId: $("#classId").val(),
        studentId: $("#studentId").val()
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
                couponList.forEach(function(entity) {
                    $(".enroll .exam-detail .coupon #coupon").append("<option data-obj=" + JSON.stringify(entity.entity) + " value='" + entity.id + "'>" + entity.name + "</option>");
                });
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
    var filter = {
        classId: $("#classId").val(),
        studentId: $("#studentId").val(),
        coupon: $('.enroll .exam-detail .coupon #coupon').val()
    };
    $.post("/enroll/pay", filter, function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            if (data.error) {
                $("#bgBack").show();
                showAlert(data.error, null, function() {
                    $("#bgBack").hide();
                });
                return;
            }
            if (data.orderId) {
                //show paycode
            }
        }
    });
});