var isNew = true;

$(document).ready(function () {
    $("#left_btnRebate").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder();

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动 
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
    selfAjax("post", "/admin/adminEnrollExam/searchPayed?" + pStr, filter, function (data) {
        if (data && data.adminEnrollExams.length > 0) {
            var getButtons = function (isPayed, isSucceed) {
                if (isPayed) { //isPayed &&
                    return '<a class="btn btn-default btnRebate">退费</a>';
                }
                return '';
            };
            data.adminEnrollExams.forEach(function (examOrder) {
                var $tr = $('<tr id=' + examOrder._id + '><td>' + examOrder._id + '</td><td>' +
                    examOrder.studentName + '</td><td>' + examOrder.examName + '</td><td>' +
                    (examOrder.isPayed ? "是" : "否") + '</td><td>' +
                    (examOrder.payPrice || 0) + '</td><td>' +
                    getPayway(examOrder.payWay) + '</td><td>' +
                    (examOrder.rebatePrice || 0) + '</td><td>' +
                    '</td><td><div class="btn-group">' + getButtons(examOrder.isPayed) + '</div></td></tr>');
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

function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation(callback) {
    setTimeout(function () {
        $('#myModal').formValidation({
            declarative: false,
            // List of fields and their validation rules
            fields: {
                'price': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '退款金额不能为空'
                        },
                        stringLength: {
                            max: 10,
                            message: '退款金额不能超过10个字符'
                        },
                        numeric: {
                            message: '填写的不是数字',
                        }
                    }
                }
            }
        });
    }, 0);
};

$("#gridBody").on("click", "td .btnRebate", function (e) {
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");

    if (entity.payWay == 6) {
        //在线
        $('#myModal #btnOnlineRebate').show();
    } else {
        //线下
        $('#myModal #btnOnlineRebate').hide();
    }

    $('#myModalLabel').text("退费");
    $('#myModal #payPrice').val(entity.payPrice);
    $('#myModal #rebatePrice').val(entity.rebatePrice);
    $('#myModal #price').val(entity.payPrice);
    $('#myModal #comment').val("");
    $('#myModal #Id').val(entity._id);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    });
});

$("#myModal #btnOfflineRebate").off("click").on("click", function (e) {
    //退款//现金
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/adminEnrollExam/rebate",
            postObj = {
                Id: $('#myModal #Id').val(),
                originalPrice: $('#myModal #payPrice').val(),
                price: $('#myModal #price').val(),
                payWay: $('#myModal #payWay').val(),
                comment: $('#myModal #comment').val()
            };
        selfAjax("post", postURI, postObj, function (data) {
            if (data.sucess) {
                showAlert("退费成功！");
                $('#confirmModal .modal-footer .btn-default').off("click").on("click", function (e) {
                    location.href = "/admin/examOrderList/id/" + $('#myModal #Id').val();
                });
                return;
            }
            showAlert("退费失败！");
        });
    }
});