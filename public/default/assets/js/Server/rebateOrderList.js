var isNew = true;

$(document).ready(function() {
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
            isSucceed: $("#InfoSearch #isSucceed").val(),
            isPayed: true
        },
        pStr = p ? "p=" + p : "";
    $selectBody.empty();
    $.post("/admin/adminEnrollTrain/search?" + pStr, filter, function(data) {
        if (data && data.adminEnrollTrains.length > 0) {
            var getButtons = function(isPayed, isSucceed) {
                if (isPayed && isSucceed !== 9) { //isPayed &&
                    return '<a class="btn btn-default btnRebate">退费</a>';
                }
                return '';
            };
            data.adminEnrollTrains.forEach(function(trainOrder) {
                var $tr = $('<tr id=' + trainOrder._id + '><td>' + trainOrder._id + '</td><td>' +
                    getTrainOrderStatus(trainOrder.isSucceed) + '</td><td>' + trainOrder.studentName + '</td><td>' + trainOrder.trainName +
                    '</td><td>' + trainOrder.trainPrice + '</td><td>' + trainOrder.materialPrice + '</td><td>' +
                    trainOrder.totalPrice + '</td><td>' + (trainOrder.rebatePrice || '') + '</td><td><div class="btn-group">' +
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

function destroy() {
    var validator = $('#myModal').data('formValidation');
    if (validator) {
        validator.destroy();
    }
};

function addValidation(callback) {
    setTimeout(function() {
        $('#myModal').formValidation({
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

$("#gridBody").on("click", "td .btnRebate", function(e) {
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $('#myModalLabel').text("退费");
    $('#myModal #totalPrice').val(entity.totalPrice);
    $('#myModal #rebatePrice').val(entity.rebatePrice);
    $('#myModal #price').val("");
    $('#myModal #comment').val("");
    $('#myModal #Id').val(entity._id);
    if (entity.attributeId) {
        $.post("/admin/adminEnrollTrain/isAttributCouponUsed", {
            studentId: entity.studentId,
            attributeId: entity.attributeId
        }, function(data) {
            if (data) {
                $('#myModal #comment').val("订单使用优惠券：" + data);
            }
            $('#myModal').modal({ backdrop: 'static', keyboard: false });
        });
    } else {
        $('#myModal').modal({ backdrop: 'static', keyboard: false });
    }
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/adminEnrollTrain/rebate",
            postObj = {
                Id: $('#myModal #Id').val(),
                originalPrice: $('#myModal #totalPrice').val(),
                price: $('#myModal #price').val(),
                comment: $('#myModal #comment').val()
            };
        $.post(postURI, postObj, function(data) {
            showAlert("退费成功！");
            $('#myModal').modal('hide');
            var name = $('#' + data._id + ' td:first-child');
            var col2 = name.next().text("已退款");
            var price = col2.next().next().next().next().next().text(data.totalPrice);
            price.next().text(data.rebatePrice);
            var $lastDiv = $('#' + data._id + ' td:last-child div');
            $lastDiv.data("obj", data);
        });
    }
});