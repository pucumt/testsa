var isNew = true;

$(document).ready(function () {
    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    $("#left_btnRebateway").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder();
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
    selfAjax("post", "/admin/rebateEnrollExam/search?" + pStr, filter, function (data) {
        $selectBody.empty();
        if (data && data.adminEnrollExams.length > 0) {

            data.adminEnrollExams.forEach(function (examOrder) {
                var $tr = $('<tr id=' + examOrder._id + '><td>' + moment(examOrder.createdDate).format("YYYY-MM-DD HH:mm") + '</td><td>' +
                    examOrder.studentName + '</td><td>' + examOrder.examName +
                    '</td><td>' + examOrder.rebatePrice + '</td><td>' +
                    getPayway(examOrder.rebateWay) + '</td><td><div class="btn-group">' + getButtons(examOrder.payWay) + '</div></td></tr>');
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
    $('#myModal #payWay').val(entity.rebateWay); //
    $('#myModal #id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#myModal #btnSave").on("click", function (e) {
    var postURI = "/admin/rebateEnrollExam/changePayway",
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