var isNew = true;

$(document).ready(function () {
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#left_btnPayway").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder();
});

var $selectBody = $('.content table tbody');

function getButtons(way) {
    if (way == 6 || way == 7) {
        return '';
    }
    return '<a class="btn btn-default btnEdit">修改支付</a>';
};

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val(),
            isSucceed: $("#InfoSearch #isSucceed").val()
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/adminEnrollExam/searchPayed?" + pStr, filter, function (data) {
        $selectBody.empty();
        if (data && data.adminEnrollExams.length > 0) {
            data.adminEnrollExams.forEach(function (examOrder) {
                var $tr = $('<tr id=' + examOrder._id + '><td>' + examOrder._id + '</td><td>' +
                    examOrder.studentName + '</td><td>' + examOrder.examName + '</td><td>' +
                    (examOrder.isPayed ? "是" : "否") + '</td><td>' +
                    (examOrder.payPrice || 0) + '</td><td>' +
                    getPayway(examOrder.payWay) + '</td><td>' +
                    (examOrder.rebatePrice || 0) + '</td><td>' +
                    '</td><td><div class="btn-group">' + getButtons(examOrder.payWay) + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", examOrder);
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
    $('#myModal #payWay').val(entity.payWay); //
    $('#myModal #id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#myModal #btnSave").on("click", function (e) {
    var postURI = "/admin/adminEnrollExam/changePayway",
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