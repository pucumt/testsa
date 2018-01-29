var newStudent = true,
    editStudent,
    orderId;

$(document).ready(function () {
    $(".enroll.personalCenter .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter";
    });

    loadOrders();

    $(".enroll.personalCenter .orderList ul").on("click", "#btnOpenBook", function (e) {
        var curObj = $(e.currentTarget);
        location.href = "/personalCenter/book/id/" + curObj.attr("bookId") + "?studentId=" +
            curObj.attr("studentId") + "&minLesson=" + curObj.attr("minLesson") + "&maxLesson=" + curObj.attr("maxLesson");
    });
});

function loadOrders() {
    selfAjax("post", "/personalCenter/bookOrder/all", {
            originalUrl: "/personalCenter/bookTest"
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
        orders.forEach(function (order) {
            var price = (parseFloat(order.totalPrice) + parseFloat(order.realMaterialPrice)).toFixed(2),
                status = '',
                buttons = '';
            if (order.bookId) {
                buttons += '<button type="button" bookId="' + order.bookId + '" minLesson="' + order.minLesson + '" maxLesson="' + order.maxLesson + '" studentId="' + order.studentId +
                    '" id="btnOpenBook" style="margin-right: 10px;" class="btn btn-primary btn-xs">课程</button>';
            }
            d.append('<li class="clearfix" orderId=' + order._id + '><div><div class="detail"><div class="studentName">学员:' + order.studentName +
                '</div><div class="">订单编号:' + order._id + '</div><div class="">订单日期:' +
                moment(order.createdDate).format("YYYY-MM-DD HH:mm") + '</div><div class="">上课时间:' +
                order.courseTime + '</div></div><div class="title">' + order.className +
                '</div><div class="price">' + buttons + '<span class="pull-right">总金额:' +
                price + '元</span>' + status + '</div></div></li>');
        });
        $ul.append(d);
    }
};