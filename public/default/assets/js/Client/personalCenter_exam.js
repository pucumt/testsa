var newStudent = true,
    editStudent;

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

    $(".enroll.personalCenter .orderList ul").on("click", "#btnCancel", function (e) {
        CancelOrder(e);
    });

    $(".enroll.personalCenter .orderList ul").on("click", "#btnPay", function (e) {
        GotoDetail(e);
    });
});

function loadOrders() {
    selfAjax("post", "/personalCenter/exam/all", {
        originalUrl: "/personalCenter/exam"
    }, function (data) {
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
        // d.append('<li class="header"><span class="studentName">学员</span><span class="">优惠券</span></li>');
        orders.forEach(function (order) {
            var price = order.payPrice,
                status = order.score ? '<span class="status pull-right">' + order.score + '</span>' : '',
                cancelButton = '';
            if (moment(order.enrollEndDate).isAfter(moment()) && price == 0) {
                cancelButton = '<button type="button" id="btnCancel" style="margin-left:10px;" class="btn btn-primary btn-xs pull-right">取消</button>';
            }
            if (order.payPrice > 0 && (!order.isPayed)) {
                status = '<button type="button" id="btnPay" style="margin-right: 10px;" class="btn btn-danger btn-xs pull-right">支付</button>' + status;
            }

            var $li = $('<li class="clearfix" orderId=' + order._id + '></li>'),
                $container = $('<div><div class="detail"><div class="studentName">学员:' + order.studentName +
                    '</div><div class="">订单编号:' + order._id + '</div><div class="">订单日期:' +
                    moment(order.createdDate).format("YYYY-MM-DD HH:mm") + '</div></div><div class="title">' +
                    order.className + '</div></div>');
            $li.append($container);

            if (order.examNum > 0) {
                $container.append('<div class="price">考试号:&nbsp;&nbsp;' + order.examNum + '</div>');
            }
            $container.append('<div class="price">' + cancelButton + '<button type="button" id="btnDetail" class="btn btn-primary btn-xs pull-right">详情</button>' + status + '</div>');
            d.append($li);
        });
        $ul.append(d);
    }
};

function GotoDetail(e) {
    var curObj = $(e.currentTarget),
        $li = curObj.parents("li");
    location.href = "/personalCenter/exam/id/" + $li.attr("orderId");
}

function CancelOrder(e) {
    var curObj = $(e.currentTarget),
        $li = curObj.parents("li"),
        orderId = $li.attr("orderId");
    $("#bgBack").show();
    showConfirm("确定要取消测试" + orderId + "吗？", null, function () {
        $("#bgBack").hide();
    });

    $("#btnConfirmSave").off("click").on("click", function (e) {
        curObj.attr("disabled", "disabled");
        selfAjax("post", "/cancel/exam", {
            id: orderId,
            originalUrl: "/personalCenter/exam"
        }, function (data) {
            if (data.sucess) {
                $li.remove();
                showAlert("取消成功", null, function () {
                    $("#bgBack").hide();
                });
            }
            curObj.removeAttr("disabled");
        });
    });
}