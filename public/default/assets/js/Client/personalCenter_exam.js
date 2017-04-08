var newStudent = true,
    editStudent;

$(document).ready(function() {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function(e) {
        location.href = "/personalCenter";
    });
    loadOrders();

    $(".enroll.personalCenter .orderList ul").on("click", "#btnDetail", function(e) {
        GotoDetail(e);
    });

    $(".enroll.personalCenter .orderList ul").on("click", "li .title", function(e) {
        GotoDetail(e);
    });
});

function loadOrders() {
    $.get("/personalCenter/exam/all", function(data) {
        if (data) {
            if (data.notLogin) {
                location.href = "/login";
                return;
            }

            if (data.length > 0) {
                renderOrders(data);
            } else {
                $ul.text("还没有测试订单");
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
                status = order.score ? '<span class="status pull-right">' + order.score + '</span>' : '';
            d.append('<li class="clearfix" orderId=' + order._id + '><div><div class="detail"><div class="studentName">学生:' + order.studentName +
                '</div><div class="">订单编号:' + order._id + '</div><div class="">订单日期:' +
                moment(order.orderDate).format("YYYY-MM-DD HH:mm") + '</div></div><div class="title">' +
                order.className + '</div><div class="price"><button type="button" id="btnDetail" class="btn btn-danger btn-xs pull-right">详情</button>' + status + '</div></div></li>');
        });
        $ul.append(d);
    }
};

function GotoDetail(e) {
    var curObj = $(e.currentTarget),
        $li = curObj.parents("li");
    location.href = "/personalCenter/exam/id/" + $li.attr("orderId");
}