var isNew = true;

$(document).ready(function() {
    $("#btnExamOrder").addClass("active");
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
    $.post("/admin/adminEnrollExam/search?" + pStr, filter, function(data) {
        if (data && data.adminEnrollExams.length > 0) {
            var getButtons = function(isSucceed) {
                if (isSucceed == 1) {
                    return '<a class="btn btn-default btnDelete">取消</a>';
                }
                return '';
            };
            data.adminEnrollExams.forEach(function(examOrder) {
                $selectBody.append('<tr id=' + examOrder._id + '><td>' + examOrder._id + '</td><td>' +
                    getTrainOrderStatus(examOrder.isSucceed) + '</td><td>' +
                    examOrder.studentName + '</td><td>' + examOrder.examName + '</td><td>' +
                    examOrder.examCategoryName + '</td><td><div data-obj=' +
                    JSON.stringify(examOrder) + ' class="btn-group">' + getButtons(examOrder.isSucceed) + '</div></td></tr>');
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
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

$("#gridBody").on("click", "td .btnDelete", function(e) {
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    showComfirm("确定要取消订单" + entity._id + "吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/adminEnrollExam/cancel", {
            id: entity._id,
            examId: entity.examId
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