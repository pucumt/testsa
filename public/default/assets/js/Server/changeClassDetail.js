var isNew = true;

$(document).ready(function () {
    $("#left_btnChangeClass").addClass("active");
    addValidation();
    checkAttributeCoupon();

    $("#selectModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#selectModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    if (!$('#enrollInfo #discount').val()) {
        $('#enrollInfo #discount').val(100);
    }
});

function addValidation(callback) {
    $('#enrollInfo').formValidation({
        declarative: false,
        // List of fields and their validation rules
        fields: {
            'studentName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '学生姓名不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '学生姓名在2-30个字符之间'
                    }
                }
            },
            'trainName': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '课程名称不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 30,
                        message: '课程名称在2-30个字符之间'
                    }
                }
            },
            'trainPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '培训费不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            },
            'materialPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '教材费不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            },
            'discount': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '折扣不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字',
                    }
                }
            },
            'totalPrice': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '总费用不能为空'
                    },
                    numeric: {
                        message: '填写的不是数字'
                    }
                }
            }
        }
    });
};

function checkAttributeCoupon() {
    if ($('#enrollInfo #attributeId').val() != "") {
        selfAjax("post", "/admin/adminEnrollTrain/isAttributCouponUsed", {
            studentId: $('#enrollInfo #studentId').val(),
            attributeId: $('#enrollInfo #attributeId').val()
        }, function (data) {
            if (data) {
                $('#enrollInfo #comment').val("订单使用优惠券：" + data);
            }
        });
    }
};

$("#btnEnroll").on("click", function (e) {
    var validator = $('#enrollInfo').data('formValidation').validate();
    if (validator.isValid()) {
        var postURI = "/admin/adminEnrollTrain/changeClass",
            postObj = {
                studentId: $('#enrollInfo #studentId').val(),
                studentName: $('#enrollInfo #studentName').val(),
                mobile: $('#enrollInfo #mobile').val(),
                trainId: $('#enrollInfo #trainId').val(),
                oldTrainId: $('#enrollInfo #oldTrainId').val(),
                attributeId: $('#enrollInfo #attributeId').val(),
                attributeName: $('#enrollInfo #attributeName').val(),
                trainName: $('#enrollInfo #trainName').val(),
                trainPrice: $('#enrollInfo #trainPrice').val(),
                materialPrice: $('#enrollInfo #materialPrice').val(),
                discount: $('#enrollInfo #discount').val(),
                totalPrice: $('#enrollInfo #totalPrice').val(),
                realMaterialPrice: $('#enrollInfo #realMaterialPrice').val(),
                oldOrderId: $('#enrollInfo #oldOrderId').val(),
                comment: $('#enrollInfo #comment').val(),
                schoolId: $('#enrollInfo #schoolId').val(),
                schoolArea: $('#enrollInfo #schoolArea').val()
            };
        selfAjax("post", postURI, postObj, function (data) {
            if (data && data.sucess) {
                showAlert("调班成功");
                $("#confirmModal .modal-footer .btn-default").off("click").on("click", function (e) {
                    location.href = "/admin/rebateOrderList";
                });
            } else {
                showAlert(data.error);
            }
        });
    }
});

var $selectHeader = $('#selectModal .modal-body table thead');
var $selectBody = $('#selectModal .modal-body table tbody');
var $selectSearch = $('#selectModal #InfoSearch');

var openEntity = "student";
$("#panel_btnStudent").on("click", function (e) {
    openEntity = "student";

    renderStudentSearchCriteria();
});

$("#panel_btnTrain").on("click", function (e) {
    openEntity = "train";

    renderTrainSearchCriteria();
});

$("#selectModal #InfoSearch").on("click", "#btnSearch", function (e) {
    if (openEntity == "student") {
        openStudent();
    } else if (openEntity == "train") {
        openTrain();
    }
});

$("#selectModal .paging .prepage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) - 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    }
});

$("#selectModal .paging .nextpage").on("click", function (e) {
    var page = parseInt($("#selectModal #page").val()) + 1;
    if (openEntity == "student") {
        openStudent(page);
    } else if (openEntity == "train") {
        openTrain(page);
    }
});

// function setPrice() {
//     var trainPrice = parseFloat($("#enrollInfo #trainPrice").val()),
//         discount = (parseFloat($("#enrollInfo #discount").val()) || 100),
//         realPrice = (trainPrice * discount / 100).toFixed(2);

//     $("#enrollInfo #totalPrice").val(realPrice);
// };

// $("#enrollInfo #trainPrice").on("change blur", setPrice);
// $("#enrollInfo #discount").on("change blur", setPrice);