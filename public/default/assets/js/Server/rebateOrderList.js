var isNew = true;

$(document).ready(function () {
    $("#left_btnRebate").addClass("active");
    $("#InfoSearch #isSucceed").val(1);
    searchOrder(); //search orders after get years

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动 
});

var $selectBody = $('.content table tbody');

function searchOrder(p) {
    var filter = {
            studentName: $("#InfoSearch #studentName").val(),
            className: $("#InfoSearch #className").val(),
            isSucceed: $("#InfoSearch #isSucceed").val(),
            isPayed: true
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    selfAjax("post", "/admin/adminEnrollTrain/search?" + pStr, filter, function (data) {
        if (data && data.adminEnrollTrains.length > 0) {
            var getButtons = function (isPayed, isSucceed) {
                if (isPayed) { //isPayed &&
                    return '<a class="btn btn-default btnRebate">退费</a>';
                }
                return '';
            };
            data.adminEnrollTrains.forEach(function (trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' +
                    getTrainOrderStatus(trainOrder.isSucceed) + '</td><td>' + trainOrder.mobile + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.totalPrice + '</td><td>' + getPayway(trainOrder.payWay) + '</td><td>' + (trainOrder.rebatePrice || '') + '</td><td><div class="btn-group">' +
                    getButtons(trainOrder.isPayed, trainOrder.isSucceed) + '</div></td></tr>');
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
    $('#myModal #totalPrice').val(entity.totalPrice);
    $('#myModal #rebatePrice').val(entity.rebatePrice);
    $('#myModal #price').val(entity.totalPrice);
    $('#myModal #comment').val(entity.comment);
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
        var postURI = "/admin/adminEnrollTrain/rebate",
            postObj = {
                Id: $('#myModal #Id').val(),
                originalPrice: $('#myModal #totalPrice').val(),
                price: $('#myModal #price').val(),
                payWay: $('#myModal #payWay').val(),
                comment: $('#myModal #comment').val()
            };
        selfAjax("post", postURI, postObj, function (data) {
            if (data.sucess) {
                showAlert("退费成功！");
                $('#confirmModal .modal-footer .btn-default').off("click").on("click", function (e) {
                    location.href = "/admin/trainOrderList/id/" + $('#myModal #Id').val();
                });
                return;
            }
            showAlert("退费失败！");
        });
    }
});