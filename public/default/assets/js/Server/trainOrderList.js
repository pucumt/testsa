var isNew = true;

$(document).ready(function () {
    $("#left_btnTrainOrder").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder(); //search orders after get years
});

var $selectBody = $('.content table tbody');

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val(),
            isSucceed: $("#InfoSearch #isSucceed").val(),
            orderId: $("#InfoSearch #orderId").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/adminEnrollTrain/search?" + pStr, filter, function (data) {
        $selectBody.empty();
        if (data && data.adminEnrollTrains.length > 0) {
            var getButtons = function (isPayed, isSucceed) {
                var buttons = "";
                if (!isPayed && isSucceed == 1) {
                    buttons = '<a class="btn btn-default btnPay">支付</a>';
                }
                if (isSucceed == 1) {
                    buttons += '<a class="btn btn-default btnDelete">退班</a>';
                }
                if (isSucceed == 7) {
                    buttons += '<a class="btn btn-default btnRecoverCoupon">恢复优惠券</a>';
                }
                return buttons;
            };
            data.adminEnrollTrains.forEach(function (trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td class="id">' + trainOrder._id + '</td><td>' +
                    trainOrder.mobile + '</td><td class="train" id="' + trainOrder.trainId +
                    '">' + trainOrder.trainName + '</td><td>' + trainOrder.examName + '</td><td>' + trainOrder.peopleCount + '</td><td>' +
                    trainOrder.totalPrice + '</td><td>' +
                    (trainOrder.isPayed ? "是" : "否") + '</td><td>' + getPayway(trainOrder.payWay) + '</td><td>' + (trainOrder.rebatePrice || '') +
                    '</td><td><div class="btn-group">' + getButtons(trainOrder.isPayed, trainOrder.isSucceed) + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", trainOrder);
                $selectBody.append($tr);
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
    });
};

$("#InfoSearch #btnSearch").on("click", function (e) {
    searchOrder();
});

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    searchOrder(page);
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    searchOrder(page);
});

$("#gridBody").on("click", "td .btnDelete", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showConfirm("确定要取消订单" + entity._id + "吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/adminEnrollTrain/cancel", {
            id: entity._id,
            trainId: entity.trainId
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var page = parseInt($("#selectModal #page").val());
                searchOrder(page);
            }
        });
    });
});

$("#gridBody").on("click", "td .btnRecoverCoupon", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showConfirm("确定要恢复订单" + entity._id + "的优惠券吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/adminEnrollTrain/recoverCoupon", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var page = parseInt($("#selectModal #page").val());
                searchOrder(page);
            }
        });
    });
});

$("#gridBody").on("click", "td .btnPreSave", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showConfirm("确定要预存订单" + entity._id + "吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/adminEnrollTrain/preSave", {
            id: entity._id,
            trainId: entity.trainId
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var page = parseInt($("#selectModal #page").val());
                searchOrder(page);
            }
        });
    });
});

$("#gridBody").on("click", "td .btnPay", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    location.href = "/admin/payList/" + entity._id;
});

$("#gridBody").on("click", "tr .id", function (e) {
    var obj = e.currentTarget;
    var entityId = $(obj).html();

    location.href = "/admin/adminEnrollTrain/orderDetail/" + entityId;
});

$("#gridBody").on("click", "tr .train", function (e) {
    var obj = e.currentTarget;
    var entityId = $(obj).attr("id");

    location.href = "/admin/adminEnrollTrain/trainDetail/" + entityId;
});