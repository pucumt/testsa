var isNew = true;

$(document).ready(function () {
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#left_btnRebateway").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder(); //search orders after get years
});

var $selectBody = $('.content table tbody');

function getButtons(way) {
    return '<a class="btn btn-default btnEdit">修改支付</a>';
};

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/rebateEnrollTrain/search?" + pStr, filter, function (data) {
        $selectBody.empty();
        if (data && data.adminEnrollTrains.length > 0) {

            data.adminEnrollTrains.forEach(function (trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + moment(trainOrder.createdDate).format("YYYY-MM-DD HH:mm") + '</td><td>' +
                    trainOrder.mobile + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.rebateTotalPrice + '</td><td>' +
                    getPayway(trainOrder.rebateWay) + '</td><td><div class="btn-group">' + getButtons(trainOrder.payWay) + '</div></td></tr>');
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

function refreshPage() {
    var page = parseInt($("#selectModal #page").val());
    searchOrder(page);
};

$(".content.mainModal #gridBody").on("click", "td .btnEdit", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModal #payWay').val(entity.rebateWay); //
    $('#myModal #id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#myModal #btnSave").on("click", function (e) {
    var postURI = "/admin/rebateEnrollTrain/changePayway",
        postObj = {
            payWay: $.trim($('#myModal #payWay').val()),
            id: $('#id').val()
        };
    selfAjax("post", postURI, postObj, function (data) {
        $('#myModal').modal('hide');
        if (data && data.sucess) {
            showAlert("修改成功！");
            $('#confirmModal .modal-footer .btn-default').off("click").on("click", function (e) {
                refreshPage();
            });
        } else {
            showAlert(data.error);
        }
    });
});