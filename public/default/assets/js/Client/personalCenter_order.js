var newStudent = true,
    editStudent,
    orderId;

$(document).ready(function () {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter";
    });
    loadOrders();

    $(".enroll.personalCenter .orderList ul").on("click", "#btnDetail", function (e) {
        GotoDetail(e);
    });

    $(".enroll.personalCenter .orderList ul").on("click", "li .title", function (e) {
        GotoDetail(e);
    });

    $(".enroll.personalCenter .orderList ul ").on("click", "#btnPay", function (e) {
        GotoDetail(e);
        // var curObj = $(e.currentTarget);
        // orderId = curObj.parents("li").attr("orderId");
        // $("#bgBack").show();
        // $("#pay-select").show();
    });

    $(".enroll.personalCenter .orderList ul").on("click", "#btnChangeClass", function (e) {
        var curObj = $(e.currentTarget),
            $li = curObj.parents("li");
        location.href = "/personalCenter/changeClass/id/" + $li.attr("orderId");
    });

    $(".enroll.personalCenter .orderList ul").on("click", "#btnOpenBook", function (e) {
        var curObj = $(e.currentTarget);
        location.href = "/personalCenter/book/id/" + curObj.attr("bookId") + "?studentId=" +
            curObj.attr("studentId") + "&minLesson=" + curObj.attr("minLesson") + "&maxLesson=" + curObj.attr("maxLesson");
    });
});

function loadOrders() {
    selfAjax("post", "/personalCenter/order/all", {
            originalUrl: "/personalCenter/order"
        },
        function (data) {
            if (data) {
                if (data.notLogin) {
                    location.href = "/login";
                    return;
                }

                if (data.length > 0) {
                    renderOrders(data);
                } else {
                    $ul.text("还没有课程订单");
                }
            }
        });
};

var $ul = $("#Enroll-student .orderList .student-list");

function renderOrders(orders) {
    if (orders.length > 0) {
        var d = $(document.createDocumentFragment());
        // d.append('<li class="header"><span class="studentName">学员</span><span class="">优惠券</span></li>');
        orders.forEach(function (order) {
            var price = (order.totalPrice + order.realMaterialPrice).toFixed(2),
                status = order.isPayed ? '<span class="status pull-right">已支付</span>' : '<button type="button" id="btnPay" class="btn btn-danger btn-xs">支付</button>',
                buttons = '<button type="button" id="btnDetail" style="margin-right: 10px;" class="btn btn-primary btn-xs">详情</button>';
            if (moment().isBefore(order.courseStartDate)) {
                buttons += '<button type="button" id="btnChangeClass" style="margin-right: 10px;" class="btn btn-primary btn-xs">调班</button>';
            }
            if (order.bookId) {
                buttons += '<button type="button" bookId="' + order.bookId + '" minLesson="' + order.minLesson + '" maxLesson="' + order.maxLesson + '" studentId="' + order.studentId +
                    '" id="btnOpenBook" style="margin-right: 10px;" class="btn btn-primary btn-xs">课程</button>';
            }
            d.append('<li class="clearfix" orderId=' + order._id + '><div><div class="detail"><div class="studentName">学员:' + order.studentName +
                '</div><div class="">订单编号:' + order._id + '</div><div class="">订单日期:' +
                moment(order.orderDate).format("YYYY-MM-DD HH:mm") + '</div><div class="">上课时间:' +
                order.courseTime + '</div></div><div class="title">' + order.className +
                '</div><div class="price">' + buttons + '<span class="pull-right">总金额:' +
                price + '元</span>' + status + '</div></div></li>');
        });
        $ul.append(d);
    }
};

function GotoDetail(e) {
    var curObj = $(e.currentTarget),
        $li = curObj.parents("li");
    location.href = "/personalCenter/order/id/" + $li.attr("orderId");
}

$("#pay-select .wechat").on("click", function (e) {
    $("#pay-select").hide();
    selfAjax("get", "/personalCenter/order/wechatpay/" + orderId, null, function (data) {
        if (data.error) {
            showAlert("生成付款码失败");
        } else {
            //location.href = data.url;
            $(".imgCode #imgCode").attr("src", data.imgCode);
            $(".imgCode").show();
        }
    });
});

$("#pay-select .zhifubao").on("click", function (e) {
    $("#pay-select").hide();
    selfAjax("get", "/personalCenter/order/zhifubaopay/" + orderId, null, function (data) {
        if (data.error) {
            showAlert("生成付款码失败");
        } else {
            //location.href = data.url;
            $(".imgCode #imgCode").attr("src", data.imgCode);
            $(".imgCode").show();
        }
    });
});

$("#bgBack").on("click", function (e) {
    $("#bgBack").hide();
    $("#pay-select").hide();
    $(".imgCode").hide();
});