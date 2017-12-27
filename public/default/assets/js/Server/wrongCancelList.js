var isNew = true;

$(document).ready(function () {
    $("#left_btnWrongCancel").addClass("active");
});

var $selectBody = $('.content table tbody');

function searchOrder() {
    var filter = {
        studentName: $("#InfoSearch #studentName").val()
    };
    $selectBody.empty();
    selfAjax("post", "/admin/adminEnrollTrain/wrongcancellist", filter, function (data) {
        if (data && data.length > 0) {
            var getButtons = function () {
                return '<a class="btn btn-default btnChange">恢复</a>';
            };
            var d = $(document.createDocumentFragment());
            data.forEach(function (trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' +
                    getTrainOrderStatus(trainOrder.isSucceed) + '</td><td>' + trainOrder.studentName + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.schoolArea + '</td><td>' + trainOrder.trainPrice + '</td><td>' + trainOrder.materialPrice + '</td><td>' +
                    trainOrder.totalPrice + '</td><td>' +
                    trainOrder.realMaterialPrice + '</td><td>' + (trainOrder.rebatePrice || '') + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", trainOrder);
                d.append($tr);
            });
            $selectBody.append(d);
        }
    });
};

$("#InfoSearch #btnSearch").on("click", function (e) {
    searchOrder();
});

$("#gridBody").on("click", "td .btnChange", function (e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");

    showConfirm("确定要恢复订单" + entity._id + "吗？");

    $("#btnConfirmSave").off("click").on("click", function (e) {
        selfAjax("post", "/admin/adminEnrollTrain/recover", {
            id: entity._id
        }, function (data) {
            $('#confirmModal').modal('hide');
            if (data.sucess) {
                searchOrder();
            }
        });
    });
});