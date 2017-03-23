var isNew = true;

$(document).ready(function() {
    $("#btnTrainOrder").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder();
});

var $selectBody = $('.content table tbody');

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val(),
            isSucceed: $("#InfoSearch #isSucceed").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    $.post("/admin/adminEnrollTrain/search?" + pStr, filter, function(data) {
        if (data && data.adminEnrollTrains.length > 0) {
            var getStatus = function(isSucceed) {
                    switch (isSucceed) {
                        case 1:
                            return "已报名"
                            break;
                        case 9:
                            return "已取消"
                            break;
                        case 7:
                            return "已退费"
                            break;
                    }
                },
                getButtons = function(isPayed, isSucceed) {
                    if (!isPayed && isSucceed == 1) {
                        return '<a class="btn btn-default btnDelete">取消</a>';
                    }
                    return '';
                };
            data.adminEnrollTrains.forEach(function(trainOrder) {
                $selectBody.append('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' +
                    getStatus(trainOrder.isSucceed) + '</td><td>' + trainOrder.studentName + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.trainPrice + '</td><td>' + trainOrder.materialPrice + '</td><td>' +
                    trainOrder.totalPrice + '</td><td>' + (trainOrder.isPayed ? "是" : "否") + '</td><td><div data-obj=' +
                    JSON.stringify(trainOrder) + ' class="btn-group">' + getButtons(trainOrder.isPayed, trainOrder.isSucceed) + '</div></td></tr>');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging(data);
    });
};

$("#InfoSearch #btnSearch").on("click", function(e) {
    searchOrder();
});

$("#selectModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    searchOrder(page);
});

$("#selectModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    searchOrder(page);
});


function showAlert(msg) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });
    $('#confirmModal #confirmModalLabel').text("提示");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("确定");
    $('#confirmModal #btnConfirmSave').hide();
};

function showComfirm(msg) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });
    $('#confirmModal #confirmModalLabel').text("确认");
    $('#confirmModal .modal-body').text(msg);

    $('#confirmModal .modal-footer .btn-default').text("取消");
    $('#confirmModal #btnConfirmSave').show();
};

$("#gridBody").on("click", "td .btnDelete", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showComfirm("确定要取消订单" + entity._id + "吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/adminEnrollTrain/cancel", {
            id: entity._id,
            trainId: entity.trainId
        }, function(data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                var name = $('#' + entity._id + ' td:first-child');
                name.next().text("已取消");
                var operation = $('#' + entity._id + ' td:last-child .btn-group');
                operation.find(".btnDelete").remove();
            }
        });
    });
});