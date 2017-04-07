var newStudent = true,
    editStudent;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter";
    });
    loadOrders();
});

function loadOrders() {
    $.get("/personalCenter/order/all", function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            if (data.length > 0) {
                renderOrders(data);
            } else {
                $ul.text("还没有优惠券");
            }
        }
    });
};

var $ul = $("#Enroll-student .orderList .student-list");

function renderOrders(orders) {
    if (orders.length > 0) {
        var d = $(document.createDocumentFragment());
        // d.append('<li class="header"><span class="studentName">学生</span><span class="">优惠券</span></li>');
        orders.forEach(function(order) {
            var price = (order.totalPrice + order.realMaterialPrice).toFixed(2),
                status = order.isPayed ? '<span class="status pull-right">已支付</span>' : '<button type="button" id="btnPay" class="btn btn-danger btn-xs">支付</button>';
            d.append('<li class="clearfix"><div><div class="detail"><div class="studentName">学生:' + order.studentName +
                '</div><div class="">订单编号:' + order._id + '</div><div class="">订单日期:' +
                moment(order.orderDate).format("YYYY-MM-DD HH:mm") + '</div></div><div class="title">' +
                order.className + '</div><div class="price"><span class="pull-right">总金额:' +
                price + '元</span>' + status + '</div></div></li>');
        });
        $ul.append(d);
    }
};